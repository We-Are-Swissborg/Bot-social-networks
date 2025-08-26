EN = {
  "vote-message": "📥 Come on guys, vote for $Borgy, you can vote once a day 💚%0A%0A" +
                  "⬇️⬇️⬇️%0A%0A"+
                  "https://lewk\\.com/vote/BorGY4ub2Fz4RLboGxnuxWdZts7EKhUTB624AFmfCgX%0A%0A"+
                  "\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-%0A%0A"+
                  "Click the 🚀 on our CoinGecko page 🦎%0A%0A"+
                  "⬇️⬇️⬇️%0A%0A"+
                  "https://Coingecko\\.com/coins/borgy%0A%0A"+
                  "*_Message generate by Borgy\\_Bot_*\\.",
  "buy-message": lambda data: "🟢🟢🟢 $BORGY BUY 🟢🟢🟢%0A%0A" +
                      f"🔄Sent ${data['value']}%0A"+
                      f"🔄Receipt {data['amount']} BORGY%0A"+
                      f"💲Price ${data['price_without_fee']}%0A"+
                      f"📝[TX]({data['tx_link']})",
}