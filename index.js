const express = require('express')
const app = express()
const port = 3000

const web3 = require('@solana/web3.js')
const splToken = require('@solana/spl-token')
const DEMO_WALLET_SECRET_KEY = new Uint8Array([83,202,109,195,207,211,30,252,197,120,11,36,53,171,207,215,124,198,90,53,78,125,49,172,216,236,16,44,4,162,226,136,253,88,137,177,196,249,175,45,18,53,61,194,187,236,11,147,166,141,77,198,193,207,214,155,242,189,212,153,40,122,237,13]);

async function createMint (res) {
  // Connect to cluster
  var connection = new web3.Connection(web3.clusterApiUrl("devnet"));
  var fromWallet = web3.Keypair.fromSecretKey(DEMO_WALLET_SECRET_KEY);
  
  try {
    let mint = await splToken.Token.createMint(
      connection,
      fromWallet,
      fromWallet.publicKey,
      null,
      9,
      splToken.TOKEN_PROGRAM_ID
    );

    let fromTokenAccount = await mint.getOrCreateAssociatedAccountInfo(
      fromWallet.publicKey
    );

    await mint.mintTo(
      fromTokenAccount.address,
      fromWallet.publicKey,
      [],
      10000 * (10 ** 9)
    );

    await mint.setAuthority(
      mint.publicKey,
      null,
      "MintTokens",
      fromWallet.publicKey,
      []
    );

    console.log(mint.publicKey)
    res.send('amount: 10000, mint.publicKey: ' + mint.publicKey);
  } catch (e) {
    console.log(e);
    res.send('Error occurred');
  }
}

async function send (res, token, wallet, amount) {
  // Connect to cluster
  var connection = new web3.Connection(web3.clusterApiUrl("devnet"));
  var fromWallet = web3.Keypair.fromSecretKey(DEMO_WALLET_SECRET_KEY);
  
  try {
    var myMint = new web3.PublicKey(token);
    var myToken = new splToken.Token(
      connection,
      myMint,
      splToken.TOKEN_PROGRAM_ID,
      fromWallet
    );

    // Create associated token accounts for my token if they don't exist yet
    var fromTokenAccount = await myToken.getOrCreateAssociatedAccountInfo(
      fromWallet.publicKey
    )
    var toTokenAccount = await myToken.getOrCreateAssociatedAccountInfo(
      new web3.PublicKey(wallet)
    )
    // Add token transfer instructions to transaction
    var transaction = new web3.Transaction()
      .add(
        splToken.Token.createTransferInstruction(
          splToken.TOKEN_PROGRAM_ID,
          fromTokenAccount.address,
          toTokenAccount.address,
          fromWallet.publicKey,
          [],
          amount * (10 ** 9)
        )
      );
    // Sign transaction, broadcast, and confirm
    var signature = await web3.sendAndConfirmTransaction(
      connection,
      transaction,
      [fromWallet]
    );

    console.log('wallet: ' + wallet + ' amount: ' + amount + ' signature: ' + signature);
    res.send('Successfully sent');
  } catch (e) {
    console.log(e);
    res.send('Error occurred');
  }
}

app.get('/mint', (req, res) => {
  createMint(res);
})

app.get('/send', (req, res) => {
  const token = req.query.token;
  const wallet = req.query.wallet;
  const amount = req.query.amount;

  if (!token || !wallet || !amount) {
    res.send('Wallet address or amount is null!');
    return;
  }

  send(res, token, wallet, amount);
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})