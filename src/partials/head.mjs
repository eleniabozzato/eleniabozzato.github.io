// <head> shared by every page. `css` is the page-specific stylesheet, `extra` any additional tags.
export function head({ lang, title, description, css, extra = [] }) {
  const pageCss = css ? `  <link rel="stylesheet" href="assets/css/pages/${css}.css" />\n` : '';
  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900&family=Bodoni+Moda:ital,wght@1,400;1,500;1,600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="assets/css/style.css" />
  <script src="assets/js/scale.js"></script>
${pageCss}  <link rel="icon" href="assets/img/logo-elenia.png" type="image/png" />
${extra.map((l) => `  ${l}\n`).join('')}</head>
`;
}
