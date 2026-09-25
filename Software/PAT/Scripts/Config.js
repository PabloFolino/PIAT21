function getConfig(clave) {
  const sh = SpreadsheetApp.getActive()
    .getSheetByName("Config");

  const data = sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues();

  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === clave) {
      return data[i][1];
    }
  }
  throw new Error("Config no encontrada: " + clave);
}



