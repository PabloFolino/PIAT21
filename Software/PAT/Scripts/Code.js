function doGet(e) {
  const page = (e && e.parameter && e.parameter.page)
    ? e.parameter.page
    : "inicio";

  return HtmlService
    .createHtmlOutputFromFile(page)
    .setTitle("Sistema PAT")
}

