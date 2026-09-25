function test_buscarAlumnos2() {

  const apellidoTest = "Apellido";   // ← cambiá por uno real
  const turnoTest = "TD";         // TD o TN

  try {

    Logger.log("=== TEST buscarAlumnos2 ===");
    Logger.log("Apellido: " + apellidoTest);
    Logger.log("Turno: " + turnoTest);

    const resultado = buscarAlumnos2(apellidoTest, turnoTest);

    Logger.log("Cantidad de resultados: " + (resultado ? resultado.length : 0));
    Logger.log("Resultado completo:");
    Logger.log(JSON.stringify(resultado, null, 2));

  } catch (error) {

    Logger.log("❌ ERROR EN TEST buscarAlumnos2");
    Logger.log(error.message);
    Logger.log(error.stack);

  }
}

function test_getDocentesDisponiblesPorAlumno() {

  const dniTest = "45000666";  // ← poné un DNI real que exista

  try {

    Logger.log("=== TEST getDocentesDisponiblesPorAlumno ===");
    Logger.log("DNI: " + dniTest);

    const resultado = getDocentesDisponiblesPorAlumno(dniTest);

    Logger.log("Cantidad de docentes encontrados: " + (resultado ? resultado.length : 0));
    Logger.log("Resultado completo:");
    Logger.log(JSON.stringify(resultado, null, 2));

  } catch (error) {

    Logger.log("❌ ERROR EN TEST getDocentesDisponiblesPorAlumno");
    Logger.log(error.message);
    Logger.log(error.stack);

  }
}

function test_reasignarAlumno() {

  const dniTest = "45000666";          // ← poné un DNI real

  const docenteTest = {                 // ← poné un docente real
    nombre: "Balor, Verónica",
    turno: 'TD',
    especialidad: 'CB'
  };

  try {

    Logger.log("=== TEST reasignarAlumno ===");
    Logger.log("DNI Alumno: " + dniTest);
    Logger.log("Nuevo Docente: " + docenteTest);

    const resultado = reasignarAlumno(dniTest, docenteTest);

    Logger.log("Resultado:");
    Logger.log(resultado);

  } catch (error) {

    Logger.log("❌ ERROR EN TEST reasignarAlumno");
    Logger.log("Mensaje: " + error.message);
    Logger.log("Stack: " + error.stack);

  }
}

function test_guardarDocente() {

  const docentePrueba = {
    apellidoNombre: "TEST DOCENTE",
    email: "test@correo.com",
    dni: "99999999",
    ciclos: "CB",
    turno: "TD",
    horas: 10,
    horasSin: 2,
    maxAlumnos: 20
  };

  try {

    const resultado = guardarDocente(docentePrueba);
    Logger.log("Resultado: " + resultado);

    const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Docentes");
    const ultimaFila = hoja.getLastRow();

    // Obtener encabezados
    const headers = hoja.getRange(1,1,1,hoja.getLastColumn()).getValues()[0];

    const colMaxTeorico = headers.indexOf("Maximo teórico") + 1;
    const colVacantes = headers.indexOf("Vacantes Disponibles") + 1;

    const formulaMaxTeorico = hoja.getRange(ultimaFila, colMaxTeorico).getFormula();
    const formulaVacantes = hoja.getRange(ultimaFila, colVacantes).getFormula();

    Logger.log("Fórmula Máx Teórico en nueva fila: " + formulaMaxTeorico);
    Logger.log("Fórmula Vacantes en nueva fila: " + formulaVacantes);

    if (!formulaMaxTeorico) {
      throw new Error("❌ No se copió la fórmula de Maximo teórico");
    }

    if (!formulaVacantes) {
      throw new Error("❌ No se copió la fórmula de Vacantes Disponibles");
    }

    Logger.log("✅ TEST OK - Fórmulas copiadas correctamente");

  } catch (error) {
    Logger.log("❌ ERROR EN TEST: " + error.message);
  }
}