export function GET(
  request: Request,
  context: { params: Promise<{ slug: string[] }> },
) {
  return context.params.then(({ slug }) => {
    const url = new URL(request.url);
    url.pathname = `/${slug.join("/")}`;
    return Response.redirect(url, 308);
  });
}
