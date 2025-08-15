const EN = {
  "vote-message": "📥 Come on guys, vote for $Borgy, you can vote once a day 💚%0A%0A" +
                  "⬇️⬇️⬇️%0A%0A"+
                  "https://lewk\\.com/vote/BorGY4ub2Fz4RLboGxnuxWdZts7EKhUTB624AFmfCgX%0A%0A"+
                  "\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-%0A%0A"+
                  "Click the 🚀 on our CoinGecko page 🦎%0A%0A"+
                  "⬇️⬇️⬇️%0A%0A"+
                  "https://Coingecko\\.com/coins/borgy%0A%0A"+
                  "*_Message generate by Borgy\\_Bot_*\\.",
  "buy-message": (data) =>  "🟢🟢🟢 $BORGY BUY 🟢🟢🟢%0A%0A" +
                            `🔄Sent $${data.value}%0A` +
                            `🔄Receipt ${data.amount} BORGY%0A` +
                            `💲Price $${data.priceWithoutFee}%0A` +
                            `📝[TX](${data.txLink})`,
}

export default EN;