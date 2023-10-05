const fs = require('fs');
const path = require('path');

// Función para cargar compañías del archivo
function cargarCompanias() {
  const rawData = fs.readFileSync(path.join(__dirname, 'jsons/_global_companies.json'));
  return JSON.parse(rawData).companies;
}

// Función para guardar compañías en el archivo
function guardarCompanias(companies) {
  fs.writeFileSync(path.join(__dirname, 'jsons/_global_companies.json'), JSON.stringify({ companies }));
}

function getCompanies(req, res) {
  const companies = cargarCompanias();
  res.status(200).json({ code: "OK", object: companies, message: "" });
}

function getCompanyById(req, res) {
  const companies = cargarCompanias();
  const companyId = req.query.identifier;
  const company = companies.find(c => c.identifier === companyId);

  if (company) {
    res.status(200).json({ code: "OK", object: company, message: "" });
  } else {
    res.status(404).json({ code: "NOT_FOUND", message: "Compañía no encontrada" });
  }
}

function saveCompanies(req, res) {
  const companies = cargarCompanias();
  req.body.isEnabled = (req.body.isEnabled === 'true' || req.body.isEnabled === true);
  companies.push(req.body);
  guardarCompanias(companies);
  res.status(200).json({ code: "OK", object: companies, message: "Compañía agregada con éxito." });
}

function editCompanies(req, res) {
  const companies = cargarCompanias();
  const matchedCompanyIndex = companies.findIndex(company => company.identifier === req.body.identifier);

  if (matchedCompanyIndex === -1) {
    return res.status(404).json({ code: "NOT_FOUND", message: "La compañía no existe." });
  }

  if (typeof req.body.isEnabled === 'string') {
    req.body.isEnabled = req.body.isEnabled.toLowerCase() === "true";
  }

  companies[matchedCompanyIndex] = req.body;
  guardarCompanias(companies);

  res.status(200).json({ code: "OK", object: companies, message: "Compañía editada con éxito." });
}

function deleteCompany(req, res) {
  const companies = cargarCompanias();
  const companyIdentifier = req.params.identifier;
  const matchedCompanyIndex = companies.findIndex(company => company.identifier === companyIdentifier);

  if (matchedCompanyIndex === -1) {
    return res.status(404).json({ code: "NOT_FOUND", message: "La compañía no existe." });
  }

  companies.splice(matchedCompanyIndex, 1);
  guardarCompanias(companies);

  res.status(200).json({ code: "OK", object: companies, message: "Compañía eliminada con éxito." });
}

function toggleCompanyStatus(req, res) {
  const companies = cargarCompanias();

  if (typeof req.body !== 'object' || req.body === null) {
    return res.status(400).json({ code: "BAD_REQUEST", message: "El cuerpo de la petición es inválido." });
  }

  if (!('isEnabled' in req.body)) {
    return res.status(400).json({ code: "BAD_REQUEST", message: "La propiedad isEnabled es requerida." });
  }

  if (!('identifier' in req.body)) {
    return res.status(400).json({ code: "BAD_REQUEST", message: "La propiedad identifier es requerida." });
  }

  const matchedCompanyIndex = companies.findIndex(company => company.identifier === req.body.identifier);

  if (matchedCompanyIndex === -1) {
    return res.status(404).json({ code: "NOT_FOUND", message: "La compañía no existe." });
  }

  const isEnabled = typeof req.body.isEnabled === 'string' ? req.body.isEnabled.toLowerCase() === "true" : req.body.isEnabled;
  companies[matchedCompanyIndex].isEnabled = isEnabled;
  guardarCompanias(companies);

  res.status(200).json({ code: "OK", object: companies[matchedCompanyIndex], message: "Estado de la compañía actualizado con éxito." });
}

module.exports = {
  getCompanies,
  getCompanyById,
  saveCompanies,
  editCompanies,
  deleteCompany,
  toggleCompanyStatus
};
