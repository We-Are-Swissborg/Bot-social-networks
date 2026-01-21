FR = {
  "vote-message": "📥 Allez les gars, votez pour $Borgy, vous pouvez voter une fois par jour 💚%0A%0A" +
                  "CoinMun ⤵️%0A"+
                  "https://coinmun\\.com/coins/borgy%0A%0A"+
                  "Lewk ⤵️%0A"+
                  "https://lewk\\.com/vote/BorGY4ub2Fz4RLboGxnuxWdZts7EKhUTB624AFmfCgX%0A%0A"+
                  "\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-%0A%0A"+
                  "Cliquez sur la 🚀 sur notre page CoinGecko 🦎%0A%0A"+
                  "⬇️⬇️⬇️%0A%0A"+
                  "https://Coingecko\\.com/fr/coins/borgy%0A%0A"+
                  "*_Message généré par Borgy\\_Bot_*\\.",
  "buy-message": lambda data: "🟢🟢🟢 *ACHAT $BORGY* 🟢🟢🟢%0A%0A" +
                            f"🔄Envoyé *{data['value']} $*%0A" +
                            f"🔄Reçu *{data['amount']} BORGY*%0A" +
                            f"💲Prix *{data['price_without_fee']} $*%0A" +
                            f"📝[TX]({data['tx_link']})",
  "welcome-pack": "💚 *BIENVENUE DANS LA MEUTE* 💚%0A%0A" +
                  "⚠️ Rappel%0A" +
                  "💬 Discussions normales → ici%0A" +
                  "⚡ RAIDs %26 récompenses → t\\.me/borgy\\_unleashed%0A%0A" +
                  "💰 *30M $BORGY par mois \\!*%0A" +
                  "✊🏻 *Récompenses de raids* 🤑%0A" +
                  "Détenir 3M $BORGY pour rejoindre%0A" +
                  "🔗 Connectez votre X%0A" +
                  "1️⃣Écris en DM à @BorgyRaidbot%0A" +
                  "2️⃣/profile → Connexion%0A" +
                  "3️⃣/setwallet \\(doit détenir 3M $BORGY\\)%0A" +
                  "4️⃣Autoriser ✅%0A" +
                  "📌 Conseils XP%0A" +
                  "Utilisez les boutons du bot : 💬 🔄 ❤️ 📌 ✊%0A" +
                  "Commentaires 💬 → répondez directement au MP du bot%0A%0A" +
                  "🌐 borgysol\\.com%0A" +
                  "🐦 @BorgySwissMeme",
  "swap-week": lambda swap, old_swap, variation: "💚💚*BILAN DE LA SEMAINE*💚💚%0A%0A" +
                            f"💰 *Capitalisation boursière* : {old_swap['market_cap']} \\-\\-\\> {swap['market_cap']} \\({variation['market_cap']}%25\\)%0A" +
                            f"👥 *Détenteurs* : {old_swap['holders']} \\-\\-\\> {swap['holders']} \\({variation['holders']}\\)%0A" +
                            f"📈 *Montant* : {old_swap['amount']} \\-\\-\\> {swap['amount']} \\({variation['amount']}%25\\)%0A" +
                            f"💎 *Valeur* : {old_swap['value']} \\-\\-\\> {swap['value']} \\({variation['value']}%25\\)%0A" +
                            f"💲 *Prix total* : {old_swap['price_without_fee']} \\-\\-\\> {swap['price_without_fee']} \\({variation['price_without_fee']}%25\\)" +
                            f"🤝 *Transactions* : {old_swap['swaps']} \\-\\-\\> {swap['swaps']} \\({variation['swaps']}\\)",
  "scam-alert": "🚨*ALERTE SCAMMERS*🚨%0A%0A" +
                "Chers membres,%0A" + 
                "Un rappel *CRUCIAL* pour votre sécurité :%0A%0A" + 
                "🔒La team officielle ne vous contactera *JAMAIS* en privé \\(PM\\)\\.%0A" + 
                "👀Si quelqu’un vous écrit en prétendant être de l’équipe → *C’EST UN SCAM*\\.%0A" + 
                "⛔Ne donnez *JAMAIS* vos clés privées, seed phrase ou infos sensibles\\.%0A%0A" + 
                "✅Tous les échanges officiels ont lieu *UNIQUEMENT* dans le groupe ou via nos canaux officiels\\.%0A%0A" + 
                "⚠️Restez vigilants, et si vous voyez un compte suspect → signalez\\-le immédiatement à un admin\\.%0A%0A" + 
                "Votre sécurité passe avant tout 💚🐶",
  "need-you": "🐾 BORGY ARMY, ON A BESOIN DE VOUS 💚%0A%0A" +
              "C’est le moment de faire rugir la meute sur CoinMarketCap 🚀%0A%0A" +
              "Chaque petit geste compte pour faire briller $BORGY encore plus fort 🌟%0A" +
              "Voici ce que vous pouvez faire 👇%0A" +
              "💬 Laissez un message positif dans les commentaires%0A" +
              "⭐ Ajoutez $BORGY à votre Watchlist \\(cliquez sur ★\\)%0A" +
              "❤️ Votez “Haussier” sur le sentiment du jour%0A" +
              "🗣️ Commentez, likez, interagissez avec les autres membres%0A" +
              "📈 Partagez le lien CMC sur X, Telegram et partout où bat le cœur de la communauté%0A%0A" +
              "Plus on est actifs, plus $BORGY grimpe dans les tendances et attire de nouveaux yeux 👀%0A" +
              "C’est ensemble, par notre énergie, notre présence et notre passion, que la meute avance 🚀%0A%0A" +
              "💚 Let's gooo, laissez votre empreinte sur CMC et montrez au monde la force du Borgy Spirit 🌍%0A%0A" +
              "➡️ https://coinmarketcap\\.com/currencies/borgy/ ⬅️",
  "action-time": "🐾 BORGY ARMY, L’HEURE EST VENUE DE PASSER À L’ACTION 🚀%0A%0A" +
                 "Envie de renforcer la meute et d’acheter du $BORGY en toute sécurité ?%0A" +
                 "Une seule adresse ➡️ www\\.borgysol\\.com ⬅️%0A%0A" +
                 "Suis ces 5 étapes simples :%0A" +
                 "1️⃣ Ouvre ton wallet Phantom ou Solflare 💰%0A" +
                 "2️⃣ Va sur borgysol\\.com 🐾%0A" +
                 "3️⃣ Descends un peu pour trouver notre DEX intégré ⚡%0A" +
                 "4️⃣ Connecte ton wallet 🧩%0A" +
                 "5️⃣ Et… LFG 💥%0A%0A" +
                 "🔁 Chaque achat rend Borgy plus fort 💚%0A%0A" +
                 "• Répartition des frais ⤵️%0A" +
                 "→ Marketing \\(DAO\\) : 30%25%0A" +
                 "→ Rachats : 30%25%0A" +
                 "→ Staking : 30%25%0A" +
                 "→ Charité : 10%25%0A%0A" +
                 "Notre site est le QG officiel de Borgy : simple, sécurisé et 100%25 Borgy vibes 💎%0A" +
                 "Alors, prêt à rejoindre la meute sur le terrain ? 🔥%0A%0A" +
                 "➡️ www\\.borgysol\\.com ⬅️%0A%0A" +
                 "💚 Le cœur de BORGY bat ici 💚",
  # "ticket-message": "🔊 $BORGY MILLIONS 🎊%0A%0A" +
  #                   "🎟️ Procurez\\-vous vos billets pour avoir la chance de devenir l'un des 3 heureux gagnants 🍀🍀🍀%0A%0A" +
  #                   "• Détails ⤵️%0A" +
  #                   "💰 Prize pool garanti de 10’000$%0A" +
  #                   "🎟️ Prix du ticket : 164K $BORGY \\~ 10$%0A" +
  #                   "🏆 3 gagnants : répartition 70%25 %0A" +
  #                   "\\(40%25 \\- 20%25 \\- 10%25\\)%0A" +
  #                   "🏦 20%25 en warchest%0A" +
  #                   "\\*redistribués à notre communauté 💚%0A%0A" +
  #                   "➡️ [borgy\\.memesforge\\.fun/millions](https://borgy.memesforge.fun/millions) ⬅️%0A%0A" +
  #                   "🗓 Tirage : Lundi 15 septembre à 20h UTC",
}
