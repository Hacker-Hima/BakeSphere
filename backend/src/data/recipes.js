export const masterRecipes = [
  {
    id: "REC-01",
    productId: 1,
    name: "Belgian Chocolate Truffle Cake",
    baseBatchUnit: "1 Cake (1 kg)",
    preparationTimeMin: 75,
    bakingTimeMin: 35,
    bakingTemperatureC: 175,
    yields: 1,
    ingredients: [
      { ingredientId: "ING-01", name: "Fine Pastry Flour", baseGrams: 300, unit: "g" },
      { ingredientId: "ING-06", name: "Castor Sugar", baseGrams: 260, unit: "g" },
      { ingredientId: "ING-09", name: "Dutch Cocoa Powder", baseGrams: 60, unit: "g" },
      { ingredientId: "ING-03", name: "Callebaut 54.5% Dark Chocolate", baseGrams: 200, unit: "g" },
      { ingredientId: "ING-02", name: "Cultured Butter", baseGrams: 160, unit: "g" },
      { ingredientId: "ING-04", name: "Heavy Cream", baseGrams: 220, unit: "ml" },
      { ingredientId: "ING-05", name: "Grade A Eggs", baseGrams: 4, unit: "pcs" },
      { ingredientId: "ING-07", name: "Vanilla Bean Extract", baseGrams: 10, unit: "ml" },
      { ingredientId: "ING-14", name: "Baking Powder & Soda", baseGrams: 8, unit: "g" }
    ],
    procedure: [
      "Sift dry flour, Dutch cocoa, and leavening agents together twice.",
      "Melt Callebaut chocolate and cultured butter over a gentle water bath.",
      "Whisk eggs and castor sugar until ribbon stage (pale and doubled in volume).",
      "Fold melted chocolate mixture into the egg ribbon gently.",
      "Fold sifted dry ingredients in three batches, alternating with warm heavy cream.",
      "Pour into lined 8-inch cake tins and bake at 175°C for 35 minutes.",
      "Cool completely on wire rack before layering with whipped dark chocolate ganache."
    ]
  },
  {
    id: "REC-02",
    productId: 2,
    name: "Artisan Sourdough Boule",
    baseBatchUnit: "1 Boule (850g)",
    preparationTimeMin: 180,
    bakingTimeMin: 45,
    bakingTemperatureC: 230,
    yields: 1,
    ingredients: [
      { ingredientId: "ING-01", name: "Fine Pastry Flour / Bread Flour", baseGrams: 500, unit: "g" },
      { ingredientId: "ING-08", name: "Active Sourdough Levain / Yeast", baseGrams: 120, unit: "g" },
      { ingredientId: "ING-13", name: "Olive Oil & Water Emulsion", baseGrams: 360, unit: "ml" },
      { ingredientId: "ING-14", name: "Sea Salt", baseGrams: 10, unit: "g" }
    ],
    procedure: [
      "Autolyse flour and 90% water for 45 minutes.",
      "Incorporate active mature starter levain and salt; perform Rubaud kneading.",
      "4 rounds of stretch and folds spaced 30 minutes apart at 26°C.",
      "Pre-shape into loose round, bench rest 20 mins, then final shape into banneton.",
      "Cold retarding in fermentation chiller at 4°C for 14 hours.",
      "Score with lame and bake in steam-injected deck oven at 230°C for 45 minutes."
    ]
  },
  {
    id: "REC-03",
    productId: 3,
    name: "French Butter Croissant",
    baseBatchUnit: "Batch of 10 Croissants",
    preparationTimeMin: 240,
    bakingTimeMin: 20,
    bakingTemperatureC: 195,
    yields: 10,
    ingredients: [
      { ingredientId: "ING-01", name: "Fine Pastry Flour", baseGrams: 500, unit: "g" },
      { ingredientId: "ING-02", name: "Cultured Butter (Lamination Sheet)", baseGrams: 280, unit: "g" },
      { ingredientId: "ING-06", name: "Castor Sugar", baseGrams: 60, unit: "g" },
      { ingredientId: "ING-08", name: "Instant Baker's Yeast", baseGrams: 12, unit: "g" },
      { ingredientId: "ING-05", name: "Grade A Eggs (Egg Wash)", baseGrams: 2, unit: "pcs" },
      { ingredientId: "ING-14", name: "Sea Salt", baseGrams: 10, unit: "g" }
    ],
    procedure: [
      "Knead détrempe dough until silky, chill overnight at 2°C.",
      "Enclose butter sheet; perform 1 double turn and 1 single turn with 30m chill intervals.",
      "Roll to 4mm thickness, cut triangles 9x25cm, stretch base, roll tightly into crescents.",
      "Proof at 26°C (80% humidity) for 2 hours until aerated and jiggly.",
      "Double egg-wash gently with pastry brush and bake at 195°C until deep amber."
    ]
  },
  {
    id: "REC-04",
    productId: 5,
    name: "Red Velvet Cheesecake",
    baseBatchUnit: "1 Cake (1.2 kg)",
    preparationTimeMin: 90,
    bakingTimeMin: 60,
    bakingTemperatureC: 160,
    yields: 1,
    ingredients: [
      { ingredientId: "ING-10", name: "Cream Cheese", baseGrams: 450, unit: "g" },
      { ingredientId: "ING-01", name: "Fine Pastry Flour", baseGrams: 220, unit: "g" },
      { ingredientId: "ING-06", name: "Castor Sugar", baseGrams: 240, unit: "g" },
      { ingredientId: "ING-02", name: "Cultured Butter", baseGrams: 120, unit: "g" },
      { ingredientId: "ING-04", name: "Heavy Cream", baseGrams: 180, unit: "ml" },
      { ingredientId: "ING-05", name: "Grade A Eggs", baseGrams: 3, unit: "pcs" },
      { ingredientId: "ING-09", name: "Dutch Cocoa Powder", baseGrams: 25, unit: "g" },
      { ingredientId: "ING-07", name: "Vanilla Extract", baseGrams: 8, unit: "ml" }
    ],
    procedure: [
      "Prepare biscuit base and blind bake for 10 minutes at 160°C.",
      "Cream Philadelphia-style cream cheese with sugar, add eggs one at a time.",
      "Alternate ribbons of ruby red velvet batter with silky cheesecake filling.",
      "Bake in a water bath at 160°C for 60 minutes with door slightly cracked.",
      "Chill for minimum 8 hours before applying cream cheese rosettes."
    ]
  }
];
