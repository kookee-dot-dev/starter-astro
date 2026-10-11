# Kookee starter for Astro

A static Astro site for the content of a [Kookee](https://kookee.dev) project: a blog, a
changelog, a help center with search, your pages and a read-only roadmap, plus the Kookee site
widget. Everything is read from Kookee at build time; a webhook rebuilds the site when you
publish.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fkookee-dot-dev%2Fstarter-astro&env=KOOKEE_API_KEY&envDescription=A%20standard%20API%20key%20from%20your%20Kookee%20project%20(API%20keys%20%E2%86%92%20Create%20Key)&envLink=https%3A%2F%2Fkookee.dev%2Fhelp%2Fsdk-amp-integration%2Fstart-a-static-site-from-the-astro-starter&project-name=kookee-site&repository-name=kookee-site)

**Live demo:** [kookee-astro.vercel.app](https://kookee-astro.vercel.app), with the content of Ledgerly, a made-up invoicing app.

Built with Astro 7, React 19 for the interactive parts,
[`@kookee/sdk`](https://www.npmjs.com/package/@kookee/sdk) and
[`@kookee/react`](https://www.npmjs.com/package/@kookee/react). No Tailwind: one stylesheet,
`src/styles/site.css`.

## What you get

| Path | What it shows |
| --- | --- |
| `/` | The newest posts and changelog entries, and the help categories |
| `/blog`, `/blog/page/2`, `/blog/{slug}` | Blog posts, 12 per page; a post with its table of contents and reactions |
| `/changelog`, `/changelog/page/2`, `/changelog/{slug}` | Changelog entries; an entry with reactions |
| `/help`, `/help/{category}`, `/help/{category}/{slug}` | Help categories and search as you type; a category's articles; an article with its table of contents and the "Was this article helpful?" vote |
| `/roadmap` | The open feedback posts by column, read-only. `KOOKEE_ROADMAP=false` leaves it out |
| `/{slug}` | Your pages, such as `/about` or `/privacy` |
| `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/blog/rss.xml`, `/changelog/rss.xml` | Files for search engines, AI crawlers and feed readers |

Pages are plain HTML. Only the interactive parts load JavaScript, once the browser is idle: the
"What's new" badge in the header, reactions, the helpful vote, the table of contents and help
search. The site widget appears after you save its settings in the Kookee dashboard (**Site widget
→ Customize**) and rebuild. Once it shows, it loads its tabs and texts in the browser, so later
changes to them show within about a minute. The header links to your hosted portal when the
project has it switched on.

Every post, changelog entry, help article and page has its title, description, canonical URL, Open
Graph tags and schema.org JSON-LD, taken from the entry and its SEO fields; the lists have a title
and a canonical URL.

## Quick start

1. In [Kookee](https://kookee.dev), create a project (or open one), go to **API keys** and press
   **Create Key**.
2. Get the code, either with **Use this template** on GitHub or:

   ```bash
   npm create astro@latest -- --template kookee-dot-dev/starter-astro
   ```

3. Copy `.env.example` to `.env` and set `KOOKEE_API_KEY`.
4. Run `npm run dev` and open http://localhost:4321.

Without a key the site builds a short setup guide instead of content.

To deploy, press **Deploy with Vercel** above: it copies the repository to your GitHub account and
asks for `KOOKEE_API_KEY`. Any static host works: `npm run build` writes the site to `dist/`.

## Environment variables

All three are read at build time.

| Name | Required | Default | What it does |
| --- | --- | --- | --- |
| `KOOKEE_API_KEY` | yes | | A standard API key of your project |
| `SITE_URL` | no | `https://` + Vercel's production domain, else `http://localhost:4321` | The site's address in canonical URLs, the sitemap, feeds and `llms.txt` |
| `KOOKEE_ROADMAP` | no | `true` | `false` leaves `/roadmap` and its header link out of the build |

## Allowed origins

The key is read during the build, and it is also written into the pages for the parts that run in
the browser: reactions, the helpful vote, help search and the site widget. In Kookee, open
**Settings → Project** and add your production domain and `http://localhost` to the **Allowed
Origins** card; `http://localhost` covers every port, and an origin with a port is not accepted.
Once the list holds an address, browsers on other sites are refused with `403 ORIGIN_NOT_ALLOWED`;
while it is empty, any site can use the key. The list belongs to the project, so it has to name
every site that uses the project's keys from a browser, such as a widget on your product's own
site. The build's own reads send no `Origin` header and are not affected. Only owners and admins
can change the list.

## What the key can do

Anyone can copy the key from your pages. With it they can read your published content, add
reactions and helpful votes, search the help center, ask the AI assistant and send feedback
through the widget. It cannot read drafts or change content.

Allowed origins stop other sites' browsers, not scripts, which send no `Origin` header. If the key
is abused, create a new one, put it in `KOOKEE_API_KEY`, rebuild, and then revoke the old one
(**Revoke key** on the **API keys** page).

## Rebuild when you publish

The site shows what Kookee had at the last build. To rebuild on every publish, point a Kookee
webhook at your host's deploy hook:

1. On Vercel, open the project's **Settings → Git → Deploy Hooks**, create a hook for your
   production branch and copy its URL. (Netlify's build hooks work the same way.)
2. In Kookee, open **Webhooks**, press **Add endpoint**, paste the URL and subscribe to the four
   `entry.*` events (published, updated, unpublished, deleted).
3. In the endpoint's menu, press **Send test**. A new deployment starts on Vercel.

- Vercel cancels a running build when its hook fires again, so a burst of publishes ends in one
  finished build; each build that starts still reads your entries. Vercel takes at most 60 hook
  calls an hour per project.
- Only a project owner or admin can add webhooks. On the Free plan a project has 2 endpoints and
  100 deliveries an hour; the rest are dropped.
- Some changes send no event and wait for the next build: renaming a category or tag, roadmap
  changes, a project rename and saved widget settings. Redeploy to pick them up.

## API usage

Every request with the key counts against the monthly request quota of the project owner's
account, shared by all their projects:

- during each build: one read per entry page, plus the lists, one export of every entry for the
paths, the sitemap and `llms.txt`, and the project, the header's changelog entries and the
footer's pages, read once;
- in the browser: each help search, the widget's Help tab and article reader, and a reaction or
  helpful vote when clicked.

A build spaces its requests to about three a second, so it stays under the Free plan's 300
requests a minute per project and leaves room for your visitors' browser reads, which share that
limit. A site of 1,000 entries takes at least six minutes to build. The Free plan has 100,000
requests a month and 50 AI answers; the widget's settings and its AI chat are not API requests,
and each chat answer uses one of the AI answers.

Reading a blog post, page or help article also counts a view in Kookee. Here that happens once per
build, not once per reader; a help article opened in the widget's article reader counts a view
each time. Help article views order the popular articles in the widget and on the portal.
Changelog entries count no views.

## Customizing

- **Look:** the tokens at the top of `src/styles/site.css`. The `.kookee-content` rule hands them
  to every Kookee component; dark mode follows the operating system.
- **URLs:** `src/lib/paths.ts`. `getPath` decides where each entry lives (links inside entry
  bodies, the sitemap and the feeds use
it), and `hrefs` gives the same paths to the lists, search and "What's new". Change both when you
change a route.
- **Pages:** `src/pages/` and `src/layouts/Base.astro`; the reads are in `src/lib/kookee.ts`. The
  components and their props are documented in the [`@kookee/react`
  README](https://www.npmjs.com/package/@kookee/react).
- **Languages:** the site reads your project's default language only, so every entry has one URL.
- **Not shown:** help articles without a category (they have no URL here), a page whose slug is
  `blog`, `changelog`, `help` or `roadmap`, and a blog post or changelog entry
whose slug is `page`, which the site's own routes would hide.

## Troubleshooting

| Error | What it means |
| --- | --- |
| `401 API_KEY_INVALID` | The key is wrong, or it was deleted. Copy it again from **API keys** |
| `403 ORIGIN_NOT_ALLOWED` | A browser request came from a domain missing from **Allowed Origins**. Add it, including `http://localhost` for development |
| `429 RATE_LIMIT_EXCEEDED` | More than the per-minute limit during a build, usually with heavy browser traffic at the same time. Run the build again |
| `429 MONTHLY_API_LIMIT_EXCEEDED` | The account used its monthly requests. The deployed site keeps working; new builds fail until the quota resets or the plan grows |

A failed read fails the build, and the host keeps serving the last good deployment.

More in the Kookee help center: [API keys and
security](https://kookee.dev/help/account-and-operations/api-keys-and-security),
[webhooks](https://kookee.dev/help/webhooks-and-integrations/send-events-to-your-site-with-webhooks)
and [rate limits and
plans](https://kookee.dev/help/account-and-operations/rate-limits-plans-and-error-handling).

## License

MIT
