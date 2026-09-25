 function loadInicio() {
  const email = getUsuarioActual();

  const regexEt21 = /^[a-z]+\.[a-z]+\.et21\.\d{2}@gmail\.com$/;

  if (
    !email ||
    (
      !email.endsWith("@bue.edu.ar") &&
      !regexEt21.test(email) &&
      email !== "pfolino@gmail.com"
    )
  ) {
      return { error: "No se pudo obtener el email del usuario" };
  } 

  const roles = getRolesUsuario(email);
  const nivel = getNivelUsuario(roles);

  return {
    email,
    roles,
    nivel
  };
} 


function getUsuarioActual() {
  const email = Session.getActiveUser().getEmail();
  return email || null;
}

/*function getUsuarioActual() {
  try {
    const email =  Session.getActiveUser().getEmail();
    return email && email.trim() ? email : null;
  } catch (e) {
    return null;
  }
}*/

/*
function getRolesUsuario(email) {

  const sh = SpreadsheetApp.getActive()
    .getSheetByName("Docentes");

  const data = sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues();

  for (let r of data) {

    const emailDoc = r[1];
    const ciclos   = r[2];

    if (emailDoc === email && ciclos) {

      return ciclos
        .split(",")
        .map(r => r.trim().toUpperCase());
    }
  }

  return [];
}
*/

function getRolesUsuario(email) {

  const sh = SpreadsheetApp.getActive()
    .getSheetByName("Docentes");

  if (!sh) throw new Error("No existe la hoja 'Docentes'");

  const data = sh.getDataRange().getValues();
  const headers = data[0];

  const colEmail  = headers.indexOf("Email");
  const colCiclos = headers.indexOf("Ciclos");

  if (colEmail === -1 || colCiclos === -1) {
    throw new Error("No se encontraron las columnas 'Email' o 'Ciclos'");
  }

  // Recorre desde la fila 2
  for (let i = 1; i < data.length; i++) {

    const emailDoc = String(data[i][colEmail]).trim().toLowerCase();
    const ciclos   = data[i][colCiclos];

    if (emailDoc === String(email).trim().toLowerCase() && ciclos) {

      return String(ciclos)
        .split(",")
        .map(c => c.trim().toUpperCase());
    }
  }

  return [];
}

function getNivelUsuario(roles) {

  if (roles.includes("AA")) return "ADMIN";
  if (roles.includes("DD")) return "DIRECTIVO";
  if (roles.some(r => ["CB", "CSC", "CSM"].includes(r))) return "DOCENTE";

  return "NINGUNO";
}

function checkAccess(pagina) {

  const email = getUsuarioActual();
  if (!email || !email.endsWith("@bue.edu.ar")) {
    throw new Error("Acceso denegado: email inválido");
  }

  const roles = getRolesUsuario(email);
  const nivel = getNivelUsuario(roles);

  const permisos = {
    docente:    ["DOCENTE", "DIRECTIVO", "ADMIN"],
    directivo:  ["DIRECTIVO", "ADMIN"],
    admin:      ["ADMIN"]
  };

  if (!permisos[pagina].includes(nivel)) {
    throw new Error("Acceso no autorizado");
  }

  return {
    email,
    roles,
    nivel
  };
}
