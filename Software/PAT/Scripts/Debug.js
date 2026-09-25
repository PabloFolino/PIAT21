function debugAlumnoActivo() {
  const dni = PropertiesService.getUserProperties()
    .getProperty("ALUMNO_ACTUAL_DNI");

  Logger.log("Usuario efectivo: " + Session.getEffectiveUser().getEmail());
  Logger.log("Usuario activo: " + Session.getActiveUser().getEmail());
  Logger.log("DNI en UserProperties: " + dni);

  return {
    dni: dni,
    userReal:  Session.getEffectiveUser().getEmail(),
    userAct: Session.getActiveUser().getEmail()
  };
}

function medirTiempo(nombre, fn) {
  const inicio = new Date().getTime();
  const resultado = fn();
  const fin = new Date().getTime();
  Logger.log(`⏱ ${nombre}: ${fin - inicio} ms`);
  return resultado;
}


