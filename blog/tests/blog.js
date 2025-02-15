import * as anchor from "@coral-xyz/anchor";
import { equal } from "assert";
import  createBlog  from "./functions/createBlog.js";
import createUser  from "./functions/createUser.js";
import createPost  from "./functions/createPost.js";
import { describe, it } from "mocha";


describe("blog-sol", () => {
  const provider = anchor.Provider.env();
  console.log("Provider: ", provider.wallet.publicKey.toString());
  anchor.setProvider(provider);
  const program = workspace.BlogSol;

  it("initialize blog account", async () => {
    const { blog, blogAccount, genesisPostAccount } = await createBlog(
      program,
      provider
    );

    // console.log("Blog account key: ", blogAccount.publicKey.toString());
    equal(
      blog.currentPostKey.toString(),
      genesisPostAccount.publicKey.toString()
    );

    equal(
      blog.authority.toString(),
      provider.wallet.publicKey.toString()
    );
  });

  // return;

  it("signup a new user", async () => {
    const { user, name, avatar } = await createUser(program, provider);

    equal(user.name, name);
    equal(user.avatar, avatar);

    equal(
      user.authority.toString(),
      provider.wallet.publicKey.toString()
    );
  });

  it("creates a new post", async () => {
    const { blog, blogAccount } = await createBlog(program, provider);
    const { userAccount } = await createUser(program, provider);

    const { title, post, content } = await createPost(
      program,
      provider,
      blogAccount,
      userAccount
    );

    equal(post.title, title);
    equal(post.content, content);
    equal(post.user.toString(), userAccount.publicKey.toString());
    equal(post.prePostKey.toString(), blog.currentPostKey.toString());
    equal(
      post.authority.toString(),
      provider.wallet.publicKey.toString()
    );
  });

  it("updates the post", async () => {
    const { blog, blogAccount } = await createBlog(program, provider);
    const { userAccount } = await createUser(program, provider);
    const { postAccount } = await createPost(
      program,
      provider,
      blogAccount,
      userAccount
    );

    // now update the created post
    const updateTitle = "Updated Post title";
    const updateContent = "Updated Post content";
    const tx = await program.rpc.updatePost(updateTitle, updateContent, {
      accounts: {
        authority: provider.wallet.publicKey,
        postAccount: postAccount.publicKey,
      },
    });

    // console.log(tx);

    const post = await program.account.postState.fetch(postAccount.publicKey);

    equal(post.title, updateTitle);
    equal(post.content, updateContent);
    equal(post.user.toString(), userAccount.publicKey.toString());
    equal(post.prePostKey.toString(), blog.currentPostKey.toString());
    equal(
      post.authority.toString(),
      provider.wallet.publicKey.toString()
    );

    // await new Promise((r) => setTimeout(r, 40000));
  });

  it("deletes the post", async () => {
    const { blogAccount } = await createBlog(program, provider);
    const { userAccount } = await createUser(program, provider);
    const { postAccount: postAcc1 } = await createPost(
      program,
      provider,
      blogAccount,
      userAccount
    );

    const { post: post2, postAccount: postAcc2 } = await createPost(
      program,
      provider,
      blogAccount,
      userAccount
    );

    const {
      post: post3,
      postAccount: postAcc3,
      title,
      content,
    } = await createPost(program, provider, blogAccount, userAccount);

    equal(postAcc2.publicKey.toString(), post3.prePostKey.toString());
    equal(postAcc1.publicKey.toString(), post2.prePostKey.toString());

    await program.rpc.deletePost({
      accounts: {
        authority: provider.wallet.publicKey,
        postAccount: postAcc2.publicKey,
        nextPostAccount: postAcc3.publicKey,
      },
    });

    const upPost3 = await program.account.postState.fetch(postAcc3.publicKey);
    equal(postAcc1.publicKey.toString(), upPost3.prePostKey.toString());

    equal(upPost3.title, title);
    equal(upPost3.content, content);
    equal(upPost3.user.toString(), userAccount.publicKey.toString());
    equal(
      upPost3.authority.toString(),
      provider.wallet.publicKey.toString()
    );

    // await new Promise((r) => setTimeout(r, 40000));
  });
});