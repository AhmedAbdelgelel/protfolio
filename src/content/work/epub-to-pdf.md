---
title: "EPUB to PDF: convert a fixed-layout book without losing the page"
lead: "A fixed-layout EPUB is already a PDF that happens to be written in HTML. Most converters translate the layout, and the layout is the first thing to die."
year: 2025
date: "2025-05-01"
metric: "1:1"
metricNote: "viewport"
summary: "every page rendered at its exact viewport, not re-typeset"
order: 3
---

## Why conversion usually breaks

Fixed-layout books position everything absolutely. Every page has a declared size, and the art, the text
and the margins are placed against it. A converter that re-typesets the document, or pushes it through a
generic print stylesheet, loses the absolute positioning, the embedded fonts and the page geometry. For a
children's book or a comic that is the entire book, not a rendering detail.

Reusing a browser is the obvious answer and also the correct one: the most accurate EPUB renderer in
existence is the engine that already reads EPUB in the wild. There is no reason to write a worse one.

## Render, don't translate

The pipeline never re-typesets anything. It renders each page the way a reader would see it, at the exact
viewport the book declares, and then prints that render.

1. Unpack the archive and read the container and OPF, so the spine decides page order.
2. Parse the XHTML for each spine item.
3. Set the viewport to the page size the book declares. One page, one viewport, no scaling.
4. Inject fonts with @font-face rules, with configurable replacement for books whose fonts cannot be
   embedded, and global CSS overrides where the publisher's stylesheet needs a print correction.
5. Print every page, then merge with pdf-lib.
6. Remove the working directory.

## What the details buy

- **Exact viewport.** A page in the PDF is the page in the book, not an approximation of it.
- **Font control.** Embedded, replaced or overridden, per book.
- **Batch conversion.** Point it at a shelf instead of a file.
- **Nothing left behind.** The temp directory is removed on success and on failure, so it runs in CI or
  in a container without filling the disk.

## The boring parts

Most of the failures in a tool like this are not rendering failures. They are archive failures: a ZIP
whose paths break on Windows, images referenced with names that are not ASCII, an OPF that names a spine
item that does not exist. Cross-platform extraction and a cleanup step that always runs are what make it
survive a real library instead of a sample file.

[Repository](https://github.com/Mo7ammedd/epub-to-pdf)
