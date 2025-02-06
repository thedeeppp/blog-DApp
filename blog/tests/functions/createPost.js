import { web3 } from "@project-serum/anchor";
const { SystemProgram } = web3;

async function createPost(program, provider, blogAccount, userAccount) {
  const postAccount = web3.Keypair.generate();
  const title = "post title";
  const content = "post content";

  await program.rpc.createPost(title, content, {
    // pass arguments to the program
    accounts: {
      blogAccount: blogAccount.publicKey,
      authority: provider.wallet.publicKey,
      userAccount: userAccount.publicKey,
      postAccount: postAccount.publicKey,
      systemProgram: SystemProgram.programId,
    },
    signers: [postAccount],
  });

  const post = await program.account.postState.fetch(postAccount.publicKey);
  return { post, postAccount, title, content };
}

export default {
  createPost,
};