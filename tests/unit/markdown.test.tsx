import { test } from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { Markdown } from "@/components/ui/Markdown";

const render = (body: string, locale = "th") => renderToStaticMarkup(<Markdown body={body} locale={locale} />);

test("article markdown escapes HTML written by an author", () => {
  const html = render('<script>alert(1)</script> <img src=x onerror="alert(1)">');
  assert.ok(!html.includes("<script>"));
  assert.ok(!html.includes("<img"));
  assert.ok(html.includes("&lt;script&gt;"));
});

test("article markdown drops javascript: links and keeps safe ones", () => {
  assert.ok(!render("[click](javascript:alert(1))").includes("href="));
  assert.ok(render("[site](https://mypos.co.th)").includes('href="https://mypos.co.th"'));
  assert.ok(render("[products](/products)").includes('href="/th/products"'), "site links stay in the reader's locale");
});

test("article markdown renders headings, bold and lists", () => {
  const html = render("## หัวข้อ\n\n**ตัวหนา**\n\n- หนึ่ง\n- สอง");
  assert.ok(html.includes("<h2"));
  assert.ok(html.includes("<strong"));
  assert.equal((html.match(/<li>/g) ?? []).length, 2);
});
