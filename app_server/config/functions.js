module.exports.sendJSONresponse = function(res, status, content) {
	res.status(status);
	res.json(content);
};

//send user profile to get updated if not complete
module.exports.checkUserProfile = function(req, res, g_redir, b_redir, g_render, b_render, g_params, b_params)
{
	g_render = g_render || null;
	b_render = b_render || null;
	if(req.user){
		if(req.user.email=='' || req.user.email==null){
			if(b_render=='' || b_render==null)
				res.redirect(b_redir);
			else
				res.render(b_render, b_params);
		}
			
	}
	else{
		if(g_render=='' || g_render==null)
			res.redirect(g_redir);
		else
			res.render(g_render, g_params);
	}
}