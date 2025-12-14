# Printable Flashcard Generator

You can create printable flashcards with borders. If you don't include images to the generation, only a words PDF will
get generated, but if you choose to include both images and words, you need to make sure that the length of both lists
is the same.

Please note that this is a very early version of the project and there might be bugs. If you find any, please report them
on the [GitHub Issues](https://github.com/kougen/printable-flashcard-generator/issues).

## Features

### Log in with Google

If you want to save your flashcards, you can log in with Google. This also allows you to add more words to a set of
flashcards with images. This is good if you want to create multi-language flashcards.

![login-with-google](./assets/login-with-google.png)

### Exclude Images

If you already have the images printed out, you can check the "Exclude Images" box to skip the image PDF generation.

![exclude-images](./assets/exclude-images.gif)

### Paste Copied Image

You can paste an image from you clipboard by clicking the "Paste" button next to the image input. This is useful if you
want to quickly add an image without having to save it to your computer first.

![copy-paste-image](./assets/copy-paste-image.gif)

## Development

Before you start the dev server, first you need to start the db container:

```sh
# Start the compose
docker compose up -d

# Run the db migrations
bunx prisma migrate

# Generate the prisma client
bunx prisma generate

# Start the dev server
bun dev

```
