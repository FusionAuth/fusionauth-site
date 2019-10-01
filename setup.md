stop :hammer: :alarm_clock:

Setup instructions BEFORE you checkout this branch
----

Run the following inside the repo directory
```bash
brew install git-lfs
git lfs install
git checkout back-to-the-fusionauth
npm install
bundle install
```

Consider removing files that are no longer ignored because they have a new home.

```bash
git status
```

Now you can serve the site
----

```bash
sb serve
```

OR

```bash
bundle jekyll serve --incremental -o
```

Oh no, I checked out this branch before using these instructions
====

You will have to remove all of the images and the plant uml jar from your fs and check them back out
AFTER installing git lfs. Otherwise those files will just be pointers and things won't work.
