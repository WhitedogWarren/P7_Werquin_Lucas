const { User, Post, Comment } = require ('../models');

exports.createComment = (req, res ) => {
    console.log('\n\nCréation de commentaire demandée.\n\n');
    console.log(`UserId : ${req.auth.userId}\npostId : ${req.params.postId}\ncontent:${req.body}`)
    console.log(req.body);
    if(!req.body.content) {
        return res.status(400).json({ message: 'le contenu est vide', newComment: null });
    }
    
    Post.findOne({where: {id: req.params.postId}}).then(post => {
        if(!post) {
            return res.status(404).json({ message: 'Post non trouvé'});
        }
        Comment.create({
            UserId: req.auth.userId,
            PostId: req.params.postId,
            content: req.body.content
        }).then(comment => {
            console.log(comment);
            //no need to include post or user, since the client already has them
            return res.status(201).json({ message: 'commentaire créé', newComment: comment.dataValues});
        }).catch(error => {
            console.log('Erreur in commentCtrl.createComment');
            return res.status(500).json({message: 'Une erreur est survenue, veuillez réessayer'});
        })
        //res.status(200).json({ message: 'demande reçue'});
    })
    
}

exports.getComments = ( req, res ) => {
    console.log(req.params);
    res.status(200).json({ message: 'demande reçue'});
}

exports.updateComment = ( req, res ) => {
    if(req.body.content == '' || !req.body.content) {
        return res.status(400).json({message: 'requête non valide : le contenu est nul', newComment: null});
    }
    Comment.findOne({where: {id: req.params.commentId}}).then(comment => {
        if(!comment) {
            return res.status(404).json({message: 'commentaire non trouvé', newComment: null});
        }
        Comment.update({ content: req.body.content}, {where: {id: req.params.commentId}})
        .then(() => {
            //fetch updated comment
            Comment.findOne({
                where: {id: req.params.commentId}
                //no need to include post or user, since the client already has them
            })
            .then(comment => {
                return res.status(201).json({message: 'commentaire mis à jour', newComment: comment})
            }).catch(error => {
                console.log('error in commentCtrl.updateComment :');
                console.log(error);
                return res.status(500).json({ message: 'Une erreur est survenue, veuillez réessayer', newComment: null});
            })
        })
        .catch(error => {
            console.log('error in commentCtrl.updateComment :');
            console.log(error);
            return res.status(500).json({ message: 'Une erreur est survenue, veuillez réessayer', newComment: null});
        })
    })
}

exports.deleteComment = ( req, res ) => {
    console.log(req.params);
    Comment.findOne({where: {id: req.params.commentId}}).then(comment => {
        if(!comment) {
            return res.status(404).json({ message: 'commentaire non trouvé', newComment: null});
        }
        if(comment.UserId !== req.auth.userId) {
            return res.status(401).json({ message: 'requête non autorisée', newComment: null});
        }
        Comment.destroy({
            where: {id: req.params.commentId}
        })
        .then((comment) => {
            return res.status(200).json({ message: 'commentaire supprimé', newComment: null});
        })
        .catch(error => {
            console.log('error in commentCtrl.deleteComment :');
            console.log(error);
            return res.status(500).json({ message: 'Une erreur est survenue, veuillez réessayer', newComment: null});
        })
    })
}