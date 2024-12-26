import got from 'got';

async function DexScreener(params) {
  const res = await got.get(`https://api.dexscreener.com/latest/dex/tokens/${params}`).json();
  return res
}

export default DexScreener;