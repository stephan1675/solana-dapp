const { Connection, PublicKey, Keypair, Transaction } = require('@solana/web3.js');
const { createCreateMetadataAccountInstruction } = require('@metaplex-foundation/mpl-token-metadata');
const PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
const fs = require('fs');

(async () => {
  // Verbindung zum Solana Devnet herstellen
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  // Lade dein Wallet (Keypair) aus einer JSON-Datei
  const secretKey = JSON.parse(fs.readFileSync('wallet.json', 'utf8'));
  const payer = Keypair.fromSecretKey(Uint8Array.from(secretKey));

  console.log('Wallet geladen:', payer.publicKey.toBase58());

  // Deine Token Mint-Adresse
  const mintAddress = new PublicKey('5a7vEDQCENKSLaVaTuHnv1AEbYGPDF9xPYeGFRzjsEK5');

  // Berechne die Metadata PDA (Program Derived Address)
  const [metadataPDA] = await PublicKey.findProgramAddress(
    [
      Buffer.from('metadata'),
      PROGRAM_ID.toBuffer(),
      mintAddress.toBuffer(),
    ],
    PROGRAM_ID
  );

  console.log('Metadata PDA:', metadataPDA.toBase58());

  // Lade die Metadaten aus der meta.json
  const metadataContent = JSON.parse(fs.readFileSync('meta.json', 'utf8'));

  // Erstelle eine Transaktion, um die Metadaten zu verknüpfen
  const tx = new Transaction().add(
    createCreateMetadataAccountInstruction(
      {
        metadata: metadataPDA,
        mint: mintAddress,
        mintAuthority: payer.publicKey,
        payer: payer.publicKey,
        updateAuthority: payer.publicKey,
      },
      {
        data: {
          name: metadataContent.name,
          symbol: metadataContent.symbol,
          uri: metadataContent.uri,
          sellerFeeBasisPoints: 0,
          creators: null,
          collection: null,
          uses: null,
        },
        isMutable: true,
      }
    )
  );

  // Sende die Transaktion
  const signature = await connection.sendTransaction(tx, [payer]);
  console.log('Transaction Signature:', signature);
})();
