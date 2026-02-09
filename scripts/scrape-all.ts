#!/usr/bin/env tsx
/**
 * Script para executar scrape de múltiplos concorrentes de uma vez
 * Uso: npx tsx scripts/scrape-all.ts [opções]
 */

import { spawn } from 'child_process';
import { config } from 'dotenv';

config({ path: '.env.local' });

// Lista de concorrentes padrão
const DEFAULT_COMPETITORS = [
  'nike',
  'adidas', 
  'puma',
  // Adicione mais concorrentes aqui
];

interface ScrapeOptions {
  competitors: string[];
  limit: number;
  delay: number;
  dryRun: boolean;
  verbose: boolean;
}

function parseArgs(): ScrapeOptions {
  const args = process.argv.slice(2);
  const options: ScrapeOptions = {
    competitors: [],
    limit: 50,
    delay: 30000, // 30 segundos entre scrapes
    dryRun: false,
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--competitors':
      case '-c':
        options.competitors = args[++i]?.split(',') || [];
        break;
      case '--limit':
      case '-l':
        options.limit = parseInt(args[++i] || '50', 10);
        break;
      case '--delay':
      case '-d':
        options.delay = parseInt(args[++i] || '30000', 10);
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
        break;
      default:
        if (!arg.startsWith('-')) {
          options.competitors.push(arg);
        }
    }
  }

  // Se não especificou concorrentes, usa o padrão
  if (options.competitors.length === 0) {
    options.competitors = DEFAULT_COMPETITORS;
  }

  return options;
}

function showHelp() {
  console.log(`
📸 Scrape All - Múltiplos Concorrentes

Uso: npx tsx scripts/scrape-all.ts [opções] [concorrentes...]

Opções:
  -c, --competitors <lista>  Lista de concorrentes (ex: nike,adidas,puma)
  -l, --limit <n>           Número de posts por perfil (padrão: 50)
  -d, --delay <ms>          Delay entre scrapes em ms (padrão: 30000)
  --dry-run                 Simula sem enviar dados
  -v, --verbose             Mostra logs detalhados
  -h, --help                Mostra esta ajuda

Exemplos:
  # Scrape de todos os concorrentes padrão
  npx tsx scripts/scrape-all.ts

  # Scrape específicos
  npx tsx scripts/scrape-all.ts nike adidas

  # Com opções
  npx tsx scripts/scrape-all.ts -c nike,adidas -l 100 -v
`);
}

function runScrape(competitor: string, options: ScrapeOptions): Promise<{ success: boolean; competitor: string; error?: string }> {
  return new Promise((resolve) => {
    const args = [
      'scripts/scrape-instagram.ts',
      competitor,
      '--limit', options.limit.toString(),
    ];

    if (options.dryRun) args.push('--dry-run');
    if (options.verbose) args.push('--verbose');

    console.log(`\n🚀 Iniciando scrape: ${competitor}`);
    console.log('─'.repeat(50));

    const child = spawn('npx', ['tsx', ...args], {
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, competitor });
      } else {
        resolve({ success: false, competitor, error: `Exit code ${code}` });
      }
    });

    child.on('error', (error) => {
      resolve({ success: false, competitor, error: error.message });
    });
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const options = parseArgs();

  console.log('\n' + '═'.repeat(60));
  console.log('📸 SCRAPE ALL - Múltiplos Concorrentes');
  console.log('═'.repeat(60));
  console.log(`\nConfiguração:`);
  console.log(`  • Concorrentes: ${options.competitors.join(', ')}`);
  console.log(`  • Posts por perfil: ${options.limit}`);
  console.log(`  • Delay entre scrapes: ${options.delay}ms`);
  console.log(`  • Dry-run: ${options.dryRun ? 'Sim' : 'Não'}`);
  console.log(`  • Verbose: ${options.verbose ? 'Sim' : 'Não'}`);
  console.log('');

  const results: Array<{ success: boolean; competitor: string; error?: string }> = [];

  for (let i = 0; i < options.competitors.length; i++) {
    const competitor = options.competitors[i];
    
    // Aguarda delay entre scrapes (exceto no primeiro)
    if (i > 0) {
      console.log(`\n⏳ Aguardando ${options.delay}ms antes do próximo...\n`);
      await sleep(options.delay);
    }

    const result = await runScrape(competitor, options);
    results.push(result);
  }

  // Relatório final
  console.log('\n' + '═'.repeat(60));
  console.log('📊 RELATÓRIO FINAL');
  console.log('═'.repeat(60));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`\n✅ Sucesso: ${successful.length}/${results.length}`);
  if (successful.length > 0) {
    successful.forEach(r => console.log(`   ✓ ${r.competitor}`));
  }

  if (failed.length > 0) {
    console.log(`\n❌ Falhas: ${failed.length}/${results.length}`);
    failed.forEach(r => console.log(`   ✗ ${r.competitor}: ${r.error}`));
  }

  console.log('\n' + '═'.repeat(60));

  // Exit code baseado nos resultados
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('\n❌ Erro fatal:', error);
  process.exit(1);
});
