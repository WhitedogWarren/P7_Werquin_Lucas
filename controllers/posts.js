const { Post, User } = require('../models');
const fs = require('fs');
const { json } = require('express/lib/response');
const { join } = require('path');

exports.getAllPosts = (req, res, next) => {
    User.findOne({where: {id: req.auth.userId}}).then(user => {
        const posts = Post.findAll({include: [User]})
        .then(data => {
            for(let post of data) {
                post.reported = JSON.parse(post.reported);
                delete post.User.dataValues.password;
            }
            let filteredData = [];
            for(let post of data) {
                if(!(post.moderated && post.UserId !== req.auth.userId))
                    filteredData.push(post);
            }
            if(user.role == 'user')
                res.status(200).json(filteredData);
            else
                res.status(200).json(data);
        })
        .catch(error => {
            console.log('error in controllers/home.js : ' + error);
            res.status(400).json({ message: 'Une erreur est survenue, veuillez réessayer'});
        })
    }).catch(error => {
        console.log('Erreur dans postCtrl.getAllPosts');
        res.status(500).json({ message : 'Une erreur est survenue, veuillez réessayer' });
    })
}

exports.getPostsFromUser = (req, res, next) => {
    const posts = Post.findAll({where: {UserId: req.params.id}, include: [User]})
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.log(error);
    })
    res.status(200).json({ message: 'demande de posts reçue par getPostsFromUser'});
}

exports.createPost = (req, res, next) => {
    //////
    // TODO : contrôler le postedContent
    //////
    let postObject = {
        UserId: req.auth.userId,
        content: req.body.postedContent,
    }
    if(req.file) {
        postObject.imageUrl = req.file.filename;
    }
    const post = Post.create(postObject).then(() => {
        res.status(200).json({message: 'création de post effectuée'});
    }).catch(error => {
        console.log('error in controller/posts.js : ' + error);
        res.status(500).json({ message: 'Le post n\'a pas pu être créé'});
    })
}

exports.updatePost = (req, res, next) => {
    if(req.file) {
        console.log('fichier détecté : ' + req.file.filename);
    }
    if(req.body.deleteImage) {
        console.log('demande de suppression de l\'image');
    }
    Post.findOne({ where: {id: req.body.postId}}).then(post => {
        if(!post)
            res.status(404).json({ error: new Error('post non trouvé')});
        function updateProcess() {
            const postObject = req.file ?
            {
                content: req.body.editedContent,
                imageUrl: req.file.filename
            } :
            {
                content: req.body.editedContent
            }
            if(req.body.deleteImage)
                postObject.imageUrl = null;
            Post.update(postObject, { where: {id: req.body.postId}}).then(() => {
                console.log('post mis à jour');
                res.status(200).json({ message: "post mis à jour" });
            }).catch(err => {
                console.log('error in postCtrl.updatePost : ' + err);
                res.status(400).json({ error: err.message});
            });
        }
        if(req.file || req.body.deleteImage) {
            fs.unlink(`images/postImage/${post.imageUrl}`, () => {
                updateProcess();
            })
        }
        else
            updateProcess();
    }).catch(err => {
        console.log('error in postCtrl.updatePost : ' + err);
        res.status(400).json({ error: err.message});
    })
}

exports.deletePost = (req, res, next) => {
    Post.destroy({where: {id: req.params.id}}).then(() => {
        res.status(200).json({ message: 'suppression de post effectuée'});
    }).catch(error => {
        console.log('Error in controller/posts.js : ' + error);
        res.status(500).json({ error: error});
    })
}

exports.reportPost = (req, res) => {
    Post.findOne({where: { id: req.body.postId}}).then(post => {
        if(!post)
            return res.status(404).json({message: 'Post non trouvé.'});
        let reportArray = JSON.parse(post.reported);
        if(reportArray.includes(req.body.userId)) {
            return res.status(401).json({ message: 'Vous avez déjà signalé ce post!'});
        }
        reportArray.push(req.body.userId);
        Post.update({reported: JSON.stringify(reportArray)}, { where: { id: req.body.postId}}).then(() => {
            console.log('Post mis à jour');
            return res.status(201).json({ message: 'Post mis à jour' });
        }).catch(error => {
            console.log('Erreur dans postCtrl.reportPost : ' + error);
            res.status(500).json({ message: 'Une erreur est survenue, veuillez réessayer'});
        });
    }).catch(error => {
        console.log('Erreur dans PostCtrl.reportPost : ' + error);
        res.status(500).json({message: 'Une erreur est survenue, veuillez réessayer.'});
    });
}

exports.unreportPost = (req, res) => {
    console.log('Demande d\'annulation de post');
    console.log(req.body);
    Post.findOne({where: {id: req.body.postId}}).then(post => {
        let reportArray = JSON.parse(post.reported);
        console.log(reportArray);
        if(!reportArray.includes(req.body.userId)) {
            console.log('user non trouvé dans reportArray');
            return res.status(401).json({ message: 'Vous n\'avez pas signalé ce post'});
        }
        reportArray.splice(reportArray.indexOf(req.body.userId), 1);
        console.log('new reportArray : ' + reportArray);
        Post.update({reported: JSON.stringify(reportArray)}, {where: { id: req.body.postId}}).then(() => {
            console.log('Post mis à jour');
            res.status(201).json({ message: 'Post mis à jour.' });
        }).catch(error => {
            console.log('error in postCtrl.unreportPost : ' + error);
            res.status(500).json({ message: 'Une erreur est survenue, veuillez réessayer.'});
        })
            
        //res.status(201).json({message: 'demande d\'annulation de signalement reçue'});
    }).catch(error => {
        console.log('Erreur in postCtrl.unreportPost : ' + error);
        res.status(500).json({ message: 'Une erreur est survenue, veuillez réessayer'});
    })
    
    
}

exports.notifyCorrection = (req, res) => {
    console.log('correction signalée');
    console.log(req.body);
    Post.update({corrected: true}, {where: {id: req.body.postId}}).then(() => {
        console.log('Post mis à jour');
        res.status(201).json({message: "Notification de correction reçue."});
    }).catch(error => {
        console.log('Error in posts.js/notifyCorrection : ' + error);
        res.status(500).json({ message: 'Une erreur est survenue, veuillez réessayer'});
    })
}

exports.avoidCorrection = (req, res) => {
    console.log('demande d\'annulation de correction');
    Post.update({corrected: false}, {where: {id: req.body.postId}}).then(() => {
        console.log('post mis à jour');
        res.status(201).json({message: "demande d\'annulation de correction reçue."});
    }).catch(error => {
        console.log('Error in posts.js/avoidCorrection : ' + error);
        res.status(500).json({ message: 'Une erreur est survenue, veuillez réessayer'});
    })
}

exports.likePost = (req, res) => {
    console.log('like demandé');
    console.log(req.body);
    Post.findOne({where: { id: req.body.postId}}).then(post => {
        if(!post) {
            console.log('Post non trouvé.');
            return res.status(404).json({ message: 'Post non trouvé.' });
        }
        let likeArray = JSON.parse(post.liked);
        let loveArray = JSON.parse(post.loved);
        let laughArray = JSON.parse(post.laughed);
        let angerArray = JSON.parse(post.angered)
        if(likeArray.includes(req.body.userId) || loveArray.includes(req.body.userId) || laughArray.includes(req.body.userId) || angerArray.includes(req.body.userId)) {
            return res.status(401).json({ message: 'Vous ne pouvez emettre qu\'une seule réaction' });
        }
        likeArray.push(req.body.userId);
        Post.update({liked: JSON.stringify(likeArray)}, {where: {id: req.body.postId}}).then(() => {
            console.log('Post mis à jour');
            res.status(201).json({ message: 'Post mis à jour'});
        }).catch(error => {
            console.log('Erreur dans postCtrl.likePost : ' + error);
            res.status(500).json({ message: 'Une erreur est survenue, veuillez réessayer'});
        })
    }).catch(error => {
        console.log('Erreur dans postCtrl.likePost : ' + error);
        res.status(500).json({ message: 'Une erreur est survenue, veuillez réessayer'});
    })
}
exports.unlikePost = (req, res) => {
    console.log('unlike demandé');
    console.log(req.body);
    Post.findOne({where: { id: req.body.postId}}).then(post => {
        if(!post) {
            console.log('Post non trouvé');
            return res.status(404).json({ message: 'Post non trouvé'});
        }
        let likeArray = JSON.parse(post.liked);
        if(!likeArray.includes(req.body.userId))
            return res.status(500).json({ message: 'Une erreur est survenue, veuillez réessayer'});
        likeArray.splice(likeArray.indexOf(req.body.userId, 1));
        Post.update({liked: JSON.stringify(likeArray)}, {where: { id: req.body.postId}}).then(() => {
            console.log('Post mis à jour');
            res.status(201).json({ message: 'Post mis à jour'});
        }).catch(error => {
            console.log('Erreur dans postCtrl.unlikePost : ' + error);
            res.status(500).json({ message: 'Une erreur est survenue, veuillez réessayer'});
        })
    }).catch(error => {
        console.log('Erreur dans postCtrl.unlikePost : ' + error);
        res.status(500).json({ message: 'Une erreur est survenue, veuillez réessayer'});
    })
}

exports.lovePost = (req, res) => {
    console.log('Love demandé');
    Post.findOne({where: {id: req.body.postId}}).then(post => {
        if(!post) {
            console.log('Post non trouvé');
            return res.status(404).json({ message: 'Post non trouvé'});
        }
        let likeArray = JSON.parse(post.liked);
        let loveArray = JSON.parse(post.loved);
        let laughArray = JSON.parse(post.laughed);
        let angerArray = JSON.parse(post.angered)
        if(likeArray.includes(req.body.userId) || loveArray.includes(req.body.userId) || laughArray.includes(req.body.userId) || angerArray.includes(req.body.userId)) {
            return res.status(401).json({ message: 'Vous ne pouvez emettre qu\'une seule réaction' });
        }
        loveArray.push(req.body.userId);
        Post.update({loved: JSON.stringify(loveArray)}, {where: {id: req.body.postId}}).then(() => {
            console.log('Post mis à jour');
            res.status(201).json({ message: 'Post mis à jour'});
        }).catch(error => {
            console.log('Erreur dans postCtrl.lovePost : ' + error);
            res.status(500).json({ message: 'Une erreur est survenue, veuillez réessayer'});
        })
    }).catch(error => {
        console.log('Erreur dans postCtrl.lovePost : ' + error);
        res.status(500).json({ message: 'Une erreur est survenue, veuillez réessayer'});
    })
}
exports.unlovePost = (req, res) => {
    console.log('Unlove demandé');
    Post.findOne({where: {id: req.body.postId}}).then(post => {
        if(!post) {
            console.log('Post non trouvé');
            return res.status(404).json({ message: 'Post non trouvé'});
        }
        let loveArray = JSON.parse(post.loved);
        if(!loveArray.includes(req.body.userId)) {
            console.log('erreur : réaction non présente en bdd');
            return res.status(500).json({ message: 'Une erreur est survenue, veuillez réessayer' });
        }
        loveArray.splice(loveArray.indexOf(req.body.userId), 1);
        Post.update({ loved: JSON.stringify(loveArray)}, { where: { id: req.body.postId}}).then(() => {
            console.log('Post mis à jour');
            res.status(201).json({ message: 'Post mis à jour' });
        }).catch(error => {
            console.log('Erreur dans postCtrl.unlovePost : ' + error);
            res.status(500).json({ message: 'Une erreur est survenue, veuillez réessayer'});
        })
    }).catch(error => {
        console.log('Erreur dans postCtrl.unlovePost : ' + error);
        res.status(500).json({ message: 'Une erreur est survenue, veuillez réessayer'});
    })
}

exports.laughPost = (req, res) => {
    Post.findOne({where: {id: req.body.postId}}).then(post => {
        if(!post) {
            console.log('Post non trouvé');
            return res.status(404).json({ message: 'Post non trouvé'});
        }
        let likeArray = JSON.parse(post.liked);
        let loveArray = JSON.parse(post.loved);
        let laughArray = JSON.parse(post.laughed);
        let angerArray = JSON.parse(post.angered)
        if(likeArray.includes(req.body.userId) || loveArray.includes(req.body.userId) || laughArray.includes(req.body.userId) || angerArray.includes(req.body.userId)) {
            return res.status(401).json({ message: 'Vous ne pouvez emettre qu\'une seule réaction' });
        }
        laughArray.push(req.body.userId);
        Post.update({laughed: JSON.stringify(laughArray)}, {where: {id: req.body.postId}}).then(() => {
            console.log('Post mis à jour');
            res.status(201).json({ message: 'Post mis à jour'});
        }).catch(error => {
            console.log('Erreur dans postCtrl.lovePost : ' + error);
            res.status(500).json({ message: 'Une erreur est survenue, veuillez réessayer'});
        })
    }).catch(error => {
        console.log('Erreur dans postCtrl.lovePost : ' + error);
        res.status(500).json({ message: 'Une erreur est survenue, veuillez réessayer'});
    })
}

exports.unlaughPost = (req, res) => {
    Post.findOne({where: {id: req.body.postId}}).then(post => {
        if(!post) {
            console.log('Post non trouvé');
            return res.status(404).json({ message: 'Post non trouvé'});
        }
        let laughArray = JSON.parse(post.laughed);
        if(!laughArray.includes(req.body.userId)) {
            console.log('erreur : réaction non présente en bdd');
            return res.status(500).json({ message: 'Une erreur est survenue, veuillez réessayer' });
        }
        laughArray.splice(laughArray.indexOf(req.body.userId), 1);
        Post.update({ laughed: JSON.stringify(laughArray)}, { where: { id: req.body.postId}}).then(() => {
            console.log('Post mis à jour');
            res.status(201).json({ message: 'Post mis à jour' });
        }).catch(error => {
            console.log('Erreur dans postCtrl.unlaughPost : ' + error);
            res.status(500).json({ message: 'Une erreur est survenue, veuillez réessayer'});
        })
    }).catch(error => {
        console.log('Erreur dans postCtrl.unlaughPost : ' + error);
        res.status(500).json({ message: 'Une erreur est survenue, veuillez réessayer'});
    })
}

exports.angerPost = (req, res) => {
    Post.findOne({ where: {id: req.body.postId}}).then(post => {
        if(!post) {
            console.log('Post non trouvé');
            return res.status(404).json({ message: 'Post non trouvé'});
        }
        let likeArray = JSON.parse(post.liked);
        let loveArray = JSON.parse(post.loved);
        let laughArray = JSON.parse(post.laughed);
        let angerArray = JSON.parse(post.angered)
        if(likeArray.includes(req.body.userId) || loveArray.includes(req.body.userId) || laughArray.includes(req.body.userId) || angerArray.includes(req.body.userId)) {
            return res.status(401).json({ message: 'Vous ne pouvez emettre qu\'une seule réaction' });
        }
        angerArray.push(req.body.userId);
        Post.update({angered: JSON.stringify(angerArray)}, {where: {id: req.body.postId}}).then(() => {
            console.log('Post mis à jour');
            res.status(201).json({ message: 'Post mis à jour'});
        }).catch(error => {
            console.log('Erreur dans postCtrl.lovePost : ' + error);
            res.status(500).json({ message: 'Une erreur est survenue, veuillez réessayer'});
        })
    }).catch(error => {
        console.log('Erreur dans postCtrl.lovePost : ' + error);
        res.status(500).json({ message: 'Une erreur est survenue, veuillez réessayer'});
    })
}

exports.unangerPost = (req, res) => {
    Post.findOne({where: {id: req.body.postId}}).then(post => {
        if(!post) {
            console.log('Post non trouvé');
            return res.status(404).json({ message: 'Post non trouvé'});
        }
        let angerArray = JSON.parse(post.angered);
        if(!angerArray.includes(req.body.userId)) {
            console.log('erreur : réaction non présente en bdd');
            return res.status(500).json({ message: 'Une erreur est survenue, veuillez réessayer' });
        }
        angerArray.splice(angerArray.indexOf(req.body.userId), 1);
        Post.update({ angered: JSON.stringify(angerArray)}, { where: { id: req.body.postId}}).then(() => {
            console.log('Post mis à jour');
            res.status(201).json({ message: 'Post mis à jour' });
        }).catch(error => {
            console.log('Erreur dans postCtrl.unlaughPost : ' + error);
            res.status(500).json({ message: 'Une erreur est survenue, veuillez réessayer'});
        })
    }).catch(error => {
        console.log('Erreur dans postCtrl.unlaughPost : ' + error);
        res.status(500).json({ message: 'Une erreur est survenue, veuillez réessayer'});
    })
}