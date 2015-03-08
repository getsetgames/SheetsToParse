// add this to your cloud code in Parse

Parse.Cloud.define("publishPattern", function(request, response) {
	var Pattern = Parse.Object.extend(request.params.patternClass);
	var query = new Parse.Query(Pattern);

	query.equalTo("name", request.params.name);
	query.find({
		success: function(results) {
			if (results.length > 0) {
				var result = results[0];
				result.set("pattern", request.params.pattern);
				result.set("rows", request.params.rows);
				result.set("columns", request.params.columns);
				result.save(null, {
					success: function(newPattern) {
						response.success("pattern updated");
					},
					error: function(newPattern, error) {
						response.error("failed to update the pattern");
					}
				});
			} else {
				var newPattern = new Pattern();

				newPattern.set("name", request.params.name);
				newPattern.set("pattern", request.params.pattern);
				newPattern.set("rows", request.params.rows);
				newPattern.set("columns", request.params.columns);
				newPattern.save(null, {
					success: function(newPattern) {
						response.success("pattern published");
					},
					error: function(newPattern, error) {
						response.error("failed to publish the pattern");
					}
				});
			}
		},
		error: function(error) {
			response.error("failed pattern query");
		}
	});
});
