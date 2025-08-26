FR = {
  "vote-message": "📥 Allez les gars, votez pour $Borgy, vous pouvez voter une fois par jour 💚%0A%0A" +
                  "⬇️⬇️⬇️%0A%0A"+
                  "https://lewk\\.com/vote/BorGY4ub2Fz4RLboGxnuxWdZts7EKhUTB624AFmfCgX%0A%0A"+
                  "\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-%0A%0A"+
                  "Cliquez sur la 🚀 sur notre page CoinGecko 🦎%0A%0A"+
                  "⬇️⬇️⬇️%0A%0A"+
                  "https://Coingecko\\.com/fr/coins/borgy%0A%0A"+
                  "*_Message généré par Borgy\\_Bot_*\\.",
  "buy-message": lambda data: "🟢🟢🟢 ACHAT $BORGY 🟢🟢🟢%0A%0A" +
                            f"🔄Envoyé {data['value']} $%0A" +
                            f"🔄Reçu {data['amount']} BORGY%0A" +
                            f"💲Prix {data['price_without_fee']} $%0A" +
                            f"📝[TX]({data['tx_link']})",
}