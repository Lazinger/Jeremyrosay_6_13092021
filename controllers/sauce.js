const Sauce = require("../models/Sauce");
const fs = require("fs");

exports.createSauce = (req, res, next) => {
	const sauceObject = JSON.parse(req.body.sauce);
	console.log(sauceObject);
	delete sauceObject._id;
	const sauce = new Sauce({
		...sauceObject,
		imageUrl:
			//Quand img pas obligatoire//
			/* req && req.file && req.file.filename ?*/ `${req.protocol}://${req.get("host")}/images/${
				req.file.filename
			}` /*: null*/,
	});
	sauce
		.save()
		.then(() => res.status(201).json({ message: "Objet enregistré !" }))
		.catch((error) => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
	const sauceObject = req.file
		? {
				...JSON.parse(req.body.sauce),
				imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
		  }
		: { ...req.body };
	Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
		.then(() => res.status(200).json({ message: "Objet modifié !" }))
		.catch((error) => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
	Sauce.findOne({ _id: req.params.id })
		.then((sauce) => {
			const filename = sauce.imageUrl.split("/images/")[1];
			fs.unlink(`images/${filename}`, () => {
				Sauce.deleteOne({ _id: req.params.id })
					.then(() => res.status(200).json({ message: "Objet supprimé" }))
					.catch((error) => res.status(400).json({ error }));
			});
		})
		.catch((error) => res.status(500).json({ error }));
};
exports.getOneSauce = (req, res, next) => {
	Sauce.findOne({ _id: req.params.id })
		.then((sauce) => res.status(200).json(sauce))
		.catch((error) => res.status(404).json({ error }));
};
exports.getAllSauces = (req, res, next) => {
	Sauce.find()
		.then((sauces) => res.status(200).json(sauces))
		.catch((error) => res.status(400).json({ error }));
};

exports.likeSauce = (req, res, next) => {
	const userId = req.body.userId;
	const like = req.body.like;
	const sauceId = req.params.id;
	console.log(userId);
	console.log(like);
	console.log(sauceId);

	Sauce.findOne({ _id: sauceId })

		.then((sauce) => {
			console.log(sauce);
			// Like Values
			const newValues = {
				usersLiked: sauce.usersLiked,
				usersDisliked: sauce.usersDisliked,
				likes: 0,
				dislikes: 0,
			};
			console.log(newValues);

			switch (like) {
				case 1: // Quand on like
					newValues.usersLiked.push(userId);
					break;
				case -1: // Quand on dislike
					newValues.usersDisliked.push(userId);
					break;
				case 0: // Annulation du like/dislike
					if (newValues.usersLiked.includes(userId)) {
						// Annulation du like
						const index = newValues.usersLiked.indexOf(userId);
						newValues.usersLiked.splice(index, 1);
					} else {
						// Annulation du dislike
						const index = newValues.usersDisliked.indexOf(userId);
						newValues.usersDisliked.splice(index, 1);
					}
					break;
			}
			// Calcul du nombre de likes / dislikes
			newValues.likes = newValues.usersLiked.length;
			newValues.dislikes = newValues.usersDisliked.length;
			console.log(newValues);
			// Mise à jour de la sauce avec les nouvelles valeurs
			Sauce.updateOne({ _id: sauceId }, newValues)
				.then(() => res.status(200).json({ message: "Sauce notée !" }))
				.catch((error) => res.status(400).json({ error }));
		})

		.catch((error) => res.status(500).json({ error }));
};
