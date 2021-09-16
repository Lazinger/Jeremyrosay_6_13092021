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
	Sauce.findOne({ _id: req.params.id })
		.then((sauce) => {
			let = likeMessage;

			if (req.body.like === 1 && !sauce.usersLiked.includes(req.body.userId)) {
				sauce.usersLiked.push(req.body.userId);
				sauce.likes++;
				likeMessage = "L'utilisateur aime cette sauce";
			}

			if (req.body.like === -1 && !sauce.usersLiked.includes(req.body.userId)) {
				sauce.usersLiked.push(req.body.userId);
				sauce.dislikes++;
				likeMessage = "L'utilisateur n'aime pas cette sauce";
			}

			if (req.body.like === 0) {
				if (sauce.usersLiked.includes(req.body.userId)) {
					sauce.usersLiked.pull(req.body.userId);
					sauce.likes--;
					likeMessage = "L'utilisateur n'aime plus cette sauce";
				} else if (sauce.usersLiked.includes(req.body.userId)) {
					sauce.usersDisliked.pull(req.body.userId);
					sauce.dislikes--;
					likeMessage = "L'utilisateur à retiré son Dislike";
				}
			}
			sauce
				.save()
				.then(() => res.status(200).json({ message: likeMessage }))
				.catch((error) => res.status(400).json({ error }));
		})
		.catch((error) => res.status(500).json({ error }));
};
