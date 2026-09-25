function getBaseUrl() {
  return ScriptApp.getService().getUrl();
}
function getLogo() {
  const idLogo = getConfig("ID_LOGO");
  
  if (!idLogo) {
    throw new Error("No se encontró ID_LOGO en Config");
  }

  const file = DriveApp.getFileById(idLogo);
  const blob = file.getBlob();
  const base64 = Utilities.base64Encode(blob.getBytes());
  const contentType = blob.getContentType();

  return {
    base64: base64,
    contentType: contentType
  };
}
