const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3000;

const dataPath = path.join(__dirname, "data", "db.json");

app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello world");
});

const readData = () => {
  const data = fs.readFileSync(dataPath, "utf-8");
  return JSON.parse(data); //JSON.parse converti la data en objet
};

const writeData = (data) => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), "utf-8");
};

// 6- Ajouter un middleware pour vérifier que le prix et la quantité sont des nombres valides
const validateProduct = (req, res, next) => {
  const { price, qte } = req.body;
  if (price && isNaN(price) && qte && isNaN(qte)) {
    return res
      .status(400)
      .send({ message: "le prix et la quantité doivent etre des nombres" });
  }
  next();
};

// 7- Ajouter un middleware de gestion d'erreurs de manière globale
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Une erreur interne est survenue" });
};

// 1- Mettez en place une route permetant d'avoir tous les produits
app.get("/products", (req, res) => {
  const data = readData();
  res.status(200).json(data);
});

/* 2- Mettez en place une route permetant d'ajouter des produits en stock et lever 
une exception lorsque les propriétés de ces produits là n'existent pas lors de la mise en stock */
app.post("/products", validateProduct, (req, res) => {
  const { name, price, qte } = req.body;
  // console.log(req.body);
  if (!name || (!price && isNaN(price)) || (!qte && isNaN(qte))) {
    return res
      .status(400)
      .send({ message: "Veuillez renseigner toutes de propriétes du produit" });
  } else {
    const data = readData();
    const newData = { id: data.length + 1, ...req.body };
    data.push(newData);
    writeData(data);
    res.status(200).json(newData);
  }
});

// 3- Mettez en place une route permetant de retouner un produit en particulier
app.get("/products/:id", (req, res) => {
  const data = readData();
  const productID = parseInt(req.params.id);
  const productFind = data.find((item) => item.id === productID);

  if (!productFind) {
    return res.status(404).json({ message: "Produit non trouvé" });
  }

  res.status(200).json(productFind);
});

/* 4- Mettez en place une route permetant de mettre à jour un produit en particulier en tenant compte du fait que
l'utilisateur à la possibilité de modifier une propriété qu'il veut */
app.put("/products/:id", (req, res) => {
  const data = readData();
  const productID = parseInt(req.params.id);
  const productIndex = data.findIndex((item) => item.id === productID);

  if (productIndex === -1) {
    return res.status(404).json({ message: "Le produit n'existe pas" });
  }
  data[productIndex] = { ...data[productIndex], ...req.body };
  writeData(data);
  res.status(200).json(data[productIndex]);
});

// 5- Mettez en place une route permetant de supprimer un produit en particulier
app.delete("/products/:id", (req, res) => {
  const data = readData();
  const productID = parseInt(req.params.id);
  const productIndex = data.findIndex((item) => item.id === productID);
  if (productIndex === -1) {
    return res.status(404).json({ message: "Le produit n'existe pas" });
  }
  data.splice(productIndex, 1);
  writeData(data);
  res.status(204).send("Suppression réussie");
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Serveur démarré sur 120.0.0.1:${port}`);
});
