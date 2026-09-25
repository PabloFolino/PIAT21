function logError(email, alumno, motivo) {
  SpreadsheetApp.getActive()
    .getSheetByName("Errores")
    .appendRow([new Date(), email, alumno, motivo]);
}

