EN = {
  "vote-message": "📥 Come on guys, vote for $Borgy, you can vote once a day 💚%0A%0A" +
                  "CoinMun ⤵️%0A"+
                  "https://coinmun\\.com/coins/borgy%0A%0A"+
                  "Lewk ⤵️%0A"+
                  "https://lewk\\.com/vote/BorGY4ub2Fz4RLboGxnuxWdZts7EKhUTB624AFmfCgX%0A%0A"+
                  "\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-%0A%0A"+
                  "Click the 🚀 on our CoinGecko page 🦎%0A%0A"+
                  "⬇️⬇️⬇️%0A%0A"+
                  "https://Coingecko\\.com/coins/borgy%0A%0A"+
                  "*_Message generate by Borgy\\_Bot_*\\.",
  "buy-message": lambda data: "🟢🟢🟢 *$BORGY BUY* 🟢🟢🟢%0A%0A" +
                      f"🔄Value paid\\* \\(USD\\) *${data['value']}*%0A"+
                      f"🔄Receipt *{data['amount']} BORGY*%0A"+
                      f"💲Price\\* *${data['price']}*%0A"+
                      f"📝[TX]({data['tx']})%0A%0A"+
                      "\\*_fee included_",
  "welcome-pack": "💚 *WELCOME TO THE PACK* 💚%0A%0A" +
                  "⚠️ *Reminder*%0A" +
                  "💬 Normal chats → here%0A" +
                  "⚡ RAIDs %26 rewards → t\\.me/borgy\\_unleashed%0A%0A" +
                  "💰 *30M $BORGY monthly \\!*%0A" +
                  "✊🏻 *Raid rewards* 🤑%0A" +
                  "Hold 3M $BORGY to join%0A" +
                  "🔗 Connect your X%0A" +
                  "1️⃣DM @BorgyRaidbot%0A" +
                  "2️⃣/profile → Login%0A" +
                  "3️⃣/setwallet \\(must hold 3M $BORGY\\)%0A" +
                  "4️⃣Authorize ✅%0A" +
                  "📌 XP Tips%0A" +
                  "Use bot buttons: 💬 🔄 ❤️ 📌 ✊%0A" +
                  "Comments 💬 → reply directly to the bot’s DM%0A%0A" +
                  "🌐 borgysol\\.com%0A" +
                  "🐦 @BorgySwissMeme",
  "unleash-welcome-pack": "💚 *WELCOME TO THE PACK* 💚%0A%0A" +
                          "⚠️ *Reminder*%0A" +
                          "💬 Community → t\\.me/borgyarmy%0A" +
                          "⚡ RAIDs %26 rewards → here%0A%0A" +
                          "💰 *30M $BORGY monthly \\!*%0A" +
                          "✊🏻 *Raid rewards* 🤑%0A" +
                          "Hold 3M $BORGY to join%0A" +
                          "🔗 Connect your X%0A" +
                          "1️⃣DM @BorgyRaidbot%0A" +
                          "2️⃣/profile → Login%0A" +
                          "3️⃣/setwallet \\(must hold 3M $BORGY\\)%0A" +
                          "4️⃣Authorize ✅%0A" +
                          "📌 XP Tips%0A" +
                          "Use bot buttons: 💬 🔄 ❤️ 📌 ✊%0A" +
                          "Comments 💬 → reply directly to the bot’s DM%0A%0A" +
                          "🌐 borgysol\\.com%0A" +
                          "🐦 @BorgySwissMeme",
  "swap-week": lambda swap, old_swap, variation: "💚💚*RESULTS OF THE WEEK*💚💚%0A%0A" +
                            f"💰 *Market capitalization*: {old_swap['market_cap']} \\-\\-\\> {swap['market_cap']} \\({variation['market_cap']}%25\\)%0A" +
                            f"👥 *Holders*: {old_swap['holders']} \\-\\-\\> {swap['holders']} \\({variation['holders']}\\)%0A" +
                            f"📈 *Amount*: {old_swap['amount']} \\-\\-\\> {swap['amount']} \\({variation['amount']}%25\\)%0A" +
                            f"💎 *Value*: {old_swap['value']} \\-\\-\\> {swap['value']} \\({variation['value']}%25\\)%0A" +
                            f"💲 *Total price*: {old_swap['price_without_fee']} \\-\\-\\> {swap['price_without_fee']} \\({variation['price_without_fee']}%25\\)" +
                            f"🤝 *Swaps*: {old_swap['swaps']} \\-\\-\\> {swap['swaps']} \\({variation['swaps']}\\)",
  "scam-alert": "🚨*SCAM ALERT*🚨%0A%0A" +
                "Dear members,%0A" + 
                "*A CRUCIAL* reminder for your safety:%0A%0A" + 
                "🔒The official team will *NEVER* contact you in private \\(PM\\)\\.%0A" + 
                "👀If someone messages you claiming to be from the team → *IT’S A SCAM*\\.%0A" + 
                "⛔*NEVER* share your private keys, seed phrase, or sensitive information\\.%0A%0A" + 
                "✅All official exchanges take place *ONLY* in the group or through our official channels\\.%0A%0A" + 
                "⚠️Stay vigilant, and if you see a suspicious account → report it immediately to an admin\\.%0A%0A" + 
                "Your safety comes first 💚🐶",
  "need-you": "🐾 BORGY ARMY, WE NEED YOU 💚%0A%0A" +
              "It’s time to make the pack roar on CoinMarketCap 🚀%0A%0A" +
              "Every small action counts to make $BORGY shine even brighter 🌟%0A" +
              "Here’s what you can do 👇%0A%0A" +
              "💬 Leave a positive message in the comments%0A" +
              "⭐ Add $BORGY to your Watchlist \\(click the ★\\)%0A" +
              "❤️ Vote “Bullish” on today’s sentiment%0A" +
              "🗣️ Comment, like, and interact with other members%0A" +
              "📈 Share the CMC link on X, Telegram, and everywhere the community vibes strong%0A%0A" +
              "The more active we are, the higher $BORGY climbs in the trends and catches new eyes 👀%0A" +
              "Together, through our energy, presence, and passion, the pack moves forward 🚀%0A%0A" +
              "💚 Let’s gooo\\! Leave your mark on CMC and show the world the power of the Borgy Spirit 🌍%0A%0A" +
              "➡️ https://coinmarketcap\\.com/currencies/borgy/ ⬅️",
  "action-time": "🐾 BORGY ARMY, THE TIME HAS COME TO TAKE ACTION 🚀%0A%0A" +
                 "Want to strengthen the pack and buy $BORGY safely?%0A" +
                 "Only one place to do it ➡️ www\\.borgysol\\.com ⬅️%0A%0A" +
                 "Follow these 5 simple steps:%0A" +
                 "1️⃣ Open your Phantom or Solflare wallet 💰%0A" +
                 "2️⃣ Go to borgysol\\.com 🐾%0A" +
                 "3️⃣ Scroll a bit down to find our integrated Dex ⚡%0A" +
                 "4️⃣ Connect your wallet 🧩%0A" +
                 "5️⃣ And… LFG 💥%0A%0A" +
                 "🔁 Every buy makes Borgy stronger 💚%0A%0A" +
                 "• Fees Allocation ⤵️%0A" +
                 "→ Marketing \\(DAO\\) : 30%25%0A" +
                 "→ Buybacks : 30%25%0A" +
                 "→ Staking : 30%25%0A" +
                 "→ Charity : 10%25%0A%0A" +
                 "Our website is the official Borgy HQ, simple, safe, and 100%25 Borgy vibes 💎%0A" +
                 "So, are you ready to join the pack on the field ? 🔥%0A%0A" +
                 "➡️ www\\.borgysol\\.com ⬅️%0A%0A" +
                 "💚 The heart of BORGY beats right here 💚",
  # "ticket-message": "🔊 $BORGY MILLIONS 🎊%0A%0A" +
  #                   "🎟️ Grab your tickets and get a chance to become one of the 3 lucky winners 🍀🍀🍀%0A%0A" +
  #                   "• Details ⤵️%0A" +
  #                   "💰10’000$ guaranteed prize pool%0A" +
  #                   "🎟️ Ticket price: 164K $BORGY \\~ 10$%0A" +
  #                   "🏆 3 winners: 70%25 split%0A" +
  #                   "\\(40%25 \\- 20%25 \\- 10%25\\)%0A" +
  #                   "🏦 20%25 warchest%0A" +
  #                   "\\*redistributed to our community 💚%0A%0A" +
  #                   "➡️ [borgy\\.memesforge\\.fun/millions](https://borgy.memesforge.fun/millions) ⬅️%0A%0A" +
  #                   "🗓 Draw: Monday, Sept 15 @ 8PM UTC",
}
