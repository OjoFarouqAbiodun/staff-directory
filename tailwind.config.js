/*
 * Tailwind CSS configuration for the Staff Directory.
 *
 * The interface styles are compiled to a static stylesheet
 * (public/assets/css/tailwind.css) with `npm run build:css`, replacing the
 * Tailwind Play CDN script that previously compiled the utilities in the
 * browser at runtime.
 *
 * The theme is intentionally left at Tailwind's defaults. The interface only
 * uses the default palette (stone, teal, emerald, amber, white) and default
 * utilities, so the defaults reproduce the previous appearance.
 *
 * `content` must scan both the HTML and every JavaScript file: most utility
 * classes are applied from JavaScript (cards, badges, modals, tasks and the
 * dashboard), so omitting the JavaScript glob would purge them from the build.
 */
module.exports = {
  content: ['./public/index.html', './public/assets/js/**/*.js']
};
