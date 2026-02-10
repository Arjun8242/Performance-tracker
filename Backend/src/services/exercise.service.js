import Exercise from '../models/Exercise.model.js';

/**
 * Query for exercises
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {number} [options.limit] - Maximum number of results per page (default = 20)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryExercises = async (filter, options) => {
    const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 20;
    const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
    const skip = (page - 1) * limit;

    const countPromise = Exercise.countDocuments(filter);
    const docsPromise = Exercise.find(filter)
        .sort({ name: 1 }) // Default sort by name ascending
        .skip(skip)
        .limit(limit)
        .lean(); // Use lean for performance since it's read-only

    const [totalResults, results] = await Promise.all([countPromise, docsPromise]);

    const totalPages = Math.ceil(totalResults / limit);

    // Map _id to id
    const exercises = results.map(doc => {
        const { _id, ...rest } = doc;
        return { id: _id.toString(), ...rest };
    });

    return {
        exercises,
        pagination: {
            total: totalResults,
            page,
            limit,
            totalPages
        }
    };
};

export {
    queryExercises
};
