// Use strict mode
"use strict";

// Import sauce model
const Sauce = require("../models/saucesModels");

// Import file system
const fs = require("fs");

// Create a sauce with ID
exports.createSauce = (req, res, next) => {
    try {
        const sauceObject = JSON.parse(req.body.sauce);
        delete sauceObject._id; // delete the ID
        delete sauceObject._userId; // delete the user ID
        // verify if the sauce already exists by name
        Sauce.findOne({ name: sauceObject.name }) // find the sauce by name
            .then((sauce) => {
                if (!sauce) {
                    // if the sauce doesn't exist
                    const sauce = new Sauce({
                        // create a new sauce
                        ...sauceObject, // spread the sauce object
                        userId: req.auth.userId, // add the user ID
                        imageUrl: `${req.protocol}://${req.get(
                            "host"
                        )}/images/${req.file.filename}`, // add the image URL
                        likes: 0, // set the likes to 0
                        dislikes: 0, // set the dislikes to 0
                        usersLiked: [], // set the usersLiked to an empty array
                        usersDisliked: [], // set the usersDisliked to an empty array
                    });
                    sauce.save(); // save the sauce
                    res.status(201).json({ message: "Sauce enregistrée !" }); // send a response
                } else {
                    res.status(400).json({ message: "Sauce déjà existante !" }); // send a response
                }
            })
            .catch((error) => res.status(400).json({ error })); // send a response
    } catch (error) {
        // catch the error
        res.status(400).json({ error }); // send a response
    }
};

// middleware to get a sauce based on the ID
exports.getOneSauce = async (req, res, next) => {
    try {
        // try to get the sauce
        const sauce = await Sauce.findOne({ _id: req.params.id }); // find the sauce by ID
        if (!sauce) {
            // if the sauce doesn't exist
            return res.status(404).json({ error: "Sauce non trouvée !" });
        }
        res.status(200).json(sauce); // send a response with the sauce
    } catch (error) {
        res.status(500).json({ error }); // send a response with the error
    }
};

// middleware to get all sauces
exports.getAllSauces = async (req, res, next) => {
    try {
        // try to get all sauces
        const sauces = await Sauce.find(); // find all sauces
        if (!sauces) {
            // if there is no sauce
            res.status(404).json({ message: "sauces not found" }); // send a response with the message
        }
        res.status(200).send(sauces); // send a response with the sauces array
    } catch (error) {
        // catch the error if there is one
        return (error) => res.status(500).json({ error }); // send a response with the error
    }
};

// middleware that delete a sauce
exports.deleteSauce = async (req, res, next) => {
    try {
        const sauce = await Sauce.findById(req.params.id); // find the sauce by ID
        // verifies the sauce author
        if (sauce.userId !== req.auth.userId) {
            // if the user is not the author
            return res.status(403).json({ message: "Unauthorized" }); // send a response with the message
        } else {
            const filename = sauce.imageUrl.split("/images")[1]; // get the image name
            fs.unlink(`images/${filename}`, async () => {
                // delete the image
                try {
                    // try to delete the sauce
                    const sauceToDelete = await Sauce.deleteOne({
                        _id: req.params.id,
                    }); // delete the sauce by ID
                    return res
                        .status(200)
                        .json({ sauceToDelete, message: "deleted" }); // send a response with the message
                } catch (error) {
                    res.status(403).json({ error }); // send a response with the error
                }
            });
        }
    } catch (error) {
        res.status(500).json({ error });
    }
};

// middleware that modify a sauce
exports.modifySauce = (req, res, next) => {
    const sauceContent = req.file
        ? {
              // parse to be able to update image
              ...JSON.parse(req.body.sauce), // spread the sauce object
              imageUrl: `${req.protocol}://${req.get("host")}/images/${
                  req.file.filename
              }`, // add the image URL
          }
        : { ...req.body }; // spread the sauce object
    delete sauceContent._userId; // delete the user ID
    Sauce.findById(req.params.id).then((sauce) => {
        if (sauce.userId !== req.auth.userId) {
            // if the user is not the author
            res.status(401).json({ message: "Unauthorized" });
        } else {
            Sauce.findByIdAndUpdate(req.params.id, {
                ...sauceContent,
                _id: req.params.id,
            })
                .then(() => res.status(200).json({ message: "Sauce update !" }))
                .catch((error) => res.status(401).json({ error }));
        }
    });
};

// middleware who manage likes and dislikes into the db
exports.likes = (req, res) => {
    Sauce.findById(req.params.id)
        .then((sauce) => {
            switch (req.body.like) {
                case 0: // if the user cancel his like or dislike
                    // verifies if the user has authorisations to like or dislike
                    if (sauce.usersLiked.includes(req.auth.userId)) {
                        // return index of userId in liked array
                        const indexOfUser = sauce.usersLiked.indexOf(
                            req.auth.userId
                        ); // find the index of the user ID
                        Sauce.findByIdAndUpdate(req.params.id, {
                            ...sauce, // spread the sauce object
                            likes: sauce.likes--, // decrement likes
                            usersLiked: sauce.usersLiked.splice(indexOfUser, 1), // remove the user from the array
                        })
                            .then(() =>
                                res
                                    .status(200)
                                    .json({ message: "Sauce unliked" })
                            ) // send a response with the message if the user has liked the sauce
                            .catch((error) => res.status(401).json({ error })); // send a response with the error if there is one
                    }
                    if (sauce.usersDisliked.includes(req.auth.userId)) {
                        const indexOfUser = sauce.usersDisliked.indexOf(
                            req.auth.userId
                        ); // return index of userId in disliked array
                        Sauce.findByIdAndUpdate(req.params.id, {
                            ...sauce, // spread the sauce object
                            dislikes: sauce.dislikes--, // decrement the dislikes
                            usersDisliked: sauce.usersDisliked.splice(
                                indexOfUser,
                                1
                            ), // remove current userId from disliked array
                        })
                            .then(() =>
                                res
                                    .status(200)
                                    .json({ message: "Sauce undisliked" })
                            ) // send a response with the message if the user has disliked the sauce
                            .catch((error) => res.status(401).json({ error })); // send a response with the error if there is one
                    }
                    break;
                case 1: // if the user like the sauce
                    // if the user has disliked the sauce
                    if (sauce.usersDisliked.includes(req.auth.userId)) {
                        const indexOfUser = sauce.usersDisliked.indexOf(
                            req.auth.userId
                        ); // return index of userId in disliked array
                        Sauce.findByIdAndUpdate(req.params.id, {
                            ...sauce, // spread the sauce object
                            likes: sauce.likes++, // increment the likes
                            usersLiked: sauce.usersLiked.push(req.auth.userId), // add the user ID to the liked array
                            dislikes: sauce.dislikes--, // decrement the dislikes
                            usersDisliked: sauce.usersDisliked.splice(
                                indexOfUser,
                                1
                            ), // remove the user ID from the disliked array
                        })
                            .then(
                                () =>
                                    res
                                        .status(200)
                                        .json({ message: "Sauce liked !" }) // send a response with the message if the sauce is liked
                            )
                            .catch((error) => res.status(401).json({ error })); // send a response with the error if there is one
                        break;
                    } else {
                        // if the user has not disliked the sauce
                        Sauce.findByIdAndUpdate(req.params.id, {
                            ...sauce, // spread the sauce object
                            likes: sauce.likes++, // increment the likes
                            usersLiked: sauce.usersLiked.push(req.auth.userId), // add the user ID to the liked array
                        })
                            .then(
                                () =>
                                    res
                                        .status(200)
                                        .json({ message: "Sauce liked !" }) // send a response with the message if the sauce is liked
                            )
                            .catch((error) => res.status(401).json({ error })); // send a response with the error if there is one
                        break;
                    }
                case -1: // if the user dislike the sauce
                    // if the user has liked the sauce
                    if (sauce.usersLiked.includes(req.auth.userId)) {
                        const indexOfUser = sauce.usersLiked.indexOf(
                            req.auth.userId
                        ); // return index of userId in liked array
                    Sauce.findByIdAndUpdate(req.params.id, {
                        ...sauce, // spread the sauce object
                        dislikes: sauce.dislikes++, // increment the dislikes
                        usersDisliked: sauce.usersDisliked.push(
                            req.auth.userId
                        ), // add the user ID to the disliked array
                        likes: sauce.likes--, // decrement the likes
                        usersLiked: sauce.usersLiked.splice(indexOfUser, 1), // remove the user ID from the liked array
                    })
                        .then(() =>
                            res
                                .status(200)
                                .json({ message: "Sauce disliked..." })
                        ) // send a response with the message "Sauce disliked..."
                        .catch((error) => res.status(401).json({ error })); // send a response with the error if there is one
                    break;
                    } else {
                        // if the user has not liked the sauce
                        Sauce.findByIdAndUpdate(req.params.id, {
                            ...sauce, // spread the sauce object
                            dislikes: sauce.dislikes++, // increment the dislikes
                            usersDisliked: sauce.usersDisliked.push(
                                req.auth.userId
                            ), // add the user ID to the disliked array
                        })
                            .then(() =>
                                res
                                    .status(200)
                                    .json({ message: "Sauce disliked..." })
                            ) // send a response with the message "Sauce disliked..."
                            .catch((error) => res.status(401).json({ error })); // send a response with the error if there is one
                        break;
                    }
            }
        })
        .catch((error) => res.status(401).json({ error })); // send a response with the error if there is one
};
