import { web3 } from "@coral-xyz/anchor";
const { SystemProgram } = web3;

export default async function createUser(program, provider) {
  const userAccount = web3.Keypair.generate();

  const name = "user name";
  const avatar = "https://img.link";

  await program.rpc.signupUser(name, avatar, {
    accounts: {
      authority: provider.wallet.publicKey,
      userAccount: userAccount.publicKey,
      systemProgram: SystemProgram.programId,
    },
    signers: [userAccount],
  });

  const user = await program.account.userState.fetch(userAccount.publicKey);
  return { user, userAccount, name, avatar };
}

