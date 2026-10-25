import {PrismaClient} from '@prisma/client';
const prisma=new PrismaClient();
async function main(){if(process.env.NODE_ENV==='production')throw new Error('Seed is development only');const rows=[['BTC','Bitcoin',8],['ETH','Ethereum',18],['USDT','Tether',6],['USDC','USD Coin',6],['SOL','Solana',9],['BNB','BNB',18]] as const;for(const [symbol,name,decimals] of rows)await prisma.asset.upsert({where:{symbol},update:{},create:{symbol,name,decimals}});console.log('Development-only asset registry seeded. No accounts or credentials created.');}
main().finally(()=>prisma.$disconnect());
