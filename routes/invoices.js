const express = require("express");
const router = new express.Router();
const db = require("../db")
const ExpressError = require("../expressError")




router.get("/", async function (req, res, next) {
    try {
        const invoicesQuery = await db.query("SELECT id, comp_code FROM invoices")
        return res.json({ invoices: invoicesQuery.rows });
    } catch (err) {
        return next(err)
    }
});


router.get("/:id", async function (req, res, next) {
    try {
        const invoicesQuery = await db.query(
            "SELECT * FROM invoices WHERE id = $1", [req.params.id]);

        if (invoicesQuery.rows.length === 0) {
            let notFoundError = new ExpressError(`There is no invoice with id '${req.params.id}`);
            notFoundError.status = 404;
            throw notFoundError;
        }
        return res.json({ invoice: invoicesQuery.rows[0] });
    } catch (err) {
        return next(err);
    }
});

router.post("/", async function (req, res, next) {
    try {
        const result = await db.query(
            `INSERT INTO invoices (id,comp_code) 
           VALUES ($1,$2) 
           RETURNING *`,
            [req.body.id, req.body.comp_code]);

        return res.status(201).json({ invoice: result.rows[0] });
    } catch (err) {
        return next(err);
    }
});

router.put("/:id", async function(req, res, next) {
    try {
      if ("id" in req.body) {
        throw new ExpressError("Not allowed", 400)
      }
  
      const result = await db.query(
        `UPDATE invoices 
             SET amt=$1
             WHERE id = $2
             RETURNING *`,
        [req.body.amt, req.params.id]);
  
      if (result.rows.length === 0) {
        throw new ExpressError(`There is no invoice with id of '${req.params.id}`, 404);
      }
  
      return res.json({ invoice: result.rows[0]});
    } catch (err) {
      return next(err);
    }
  });

  router.delete("/:id", async function(req, res, next) {
    try {
      const result = await db.query(
        "DELETE FROM invoices WHERE id = $1 RETURNING *", [req.params.id]);
  
      if (result.rows.length === 0) {
        throw new ExpressError(`There is no invoice with id of '${req.params.id}`, 404);
      }
      return res.json({ message: "invoice deleted" });
    } catch (err) {
      return next(err);
    }
  });