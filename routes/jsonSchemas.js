//TODO: überall auf JSON-Schreibweise (Camel-Case) prüfen

const taggingSchema_v1 = {
    type: 'object',
    properties: {
        positions: {
            type: 'array',
            minItems: 8,
            maxItems: 8,
            required: true,
            items: {
                type: 'object',
                required: true,
                properties: {
                    longitude: {
                        type: 'number',
                        required: true
                    },
                    latitude: {
                        type: 'number',
                        required: true
                    },
                    altitude: {
                        type: 'number'
                    },
                    horizontal_accuracy: {
                        type: 'number'
                    },
                    vertical_accuracy: {
                        type: 'number'
                    },
                    time: {
                        type: 'string'
                    },
                    cell_id: {
                        type: 'number'
                    }
                }
            }
        }
    }
};

const taggingSchema_v2 = {
    type: 'object',
    properties: {
        positions: {
            type: 'array',
            minItems: 8,
            maxItems: 8,
            required: true,
            items: {
                type: 'object',
                required: true,
                properties: {
                    longitude: {
                        type: 'number',
                        required: true
                    },
                    latitude: {
                        type: 'number',
                        required: true
                    },
                    altitude: {
                        type: 'number'
                    },
                    horizontal_accuracy: {
                        type: 'number'
                    },
                    vertical_accuracy: {
                        type: 'number'
                    },
                    time: {
                        type: 'string',
                        required: true
                    },
                    cell_id: {
                        type: 'number'
                    }
                }
            }
        }
    }
};

const taggingSchema_v3 = {
    type: 'object',
    properties: {
        positions: {
            type: 'array',
            minItems: 8,
            maxItems: 8,
            required: true,
            items: {
                type: 'object',
                required: true,
                properties: {
                    longitude: {
                        type: 'number',
                        required: true
                    },
                    latitude: {
                        type: 'number',
                        required: true
                    },
                    time: {
                        type: 'string',
                        required: true
                    },
                    phase : {
                        type: 'string',
                        required: true
                    }
                }
            }
        }
    }
};

const taggingSchema_v4 = {
    type: 'object',
    properties: {
        positions: {
            type: 'array',
            minItems: 8,
            maxItems: 8,
            required: true,
            items: {
                type: 'object',
                required: true,
                properties: {
                    longitude: {
                        type: 'number',
                        required: true
                    },
                    latitude: {
                        type: 'number',
                        required: true
                    },
                    horizontal_accuracy: {
                        type: 'number',
                        required: true
                    },
                    time: {
                        type: 'string',
                        required: true
                    },
                    phase : {
                        type: 'string',
                        required: true
                    }
                }
            }
        }
    }
};

const surroundingsSchema_v3 = {
    type: 'object',
    properties: {
        positions: {
            type: 'array',
            minItems: 8,
            maxItems: 8,
            required: true,
            items: {
                type: 'object',
                required: true,
                properties: {
                    longitude: {
                        type: 'number',
                        required: true
                    },
                    latitude: {
                        type: 'number',
                        required: true
                    },
                    phase : {
                        type: 'string',
                        required: true
                    }
                }
            }
        }
    }
};

const velocitySchema_v1 = {
    type: 'object',
    properties: {
        startTime: {
            type: 'string',
            required: true
        },
        endTime: {
            type: 'string',
            required: true
        },
        longitude1: {
            type: 'number',
            required: true
        },
        latitude1: {
            type: 'number',
            required: true
        },
        longitude2: {
            type: 'number',
            required: true
        },
        latitude2: {
            type: 'number',
            required: true
        }
    }
};

const velocitySchema_v3 = {
    type: 'object',
    properties: {
        positions: {
            type: 'array',
            minItems: 2,
            maxItems: 2,
            required: true,
            items: {
                type: 'object',
                required: true,
                properties: {
                    longitude: {
                        type: 'number',
                        required: true
                    },
                    latitude: {
                        type: 'number',
                        required: true
                    },
                    time: {
                        type: 'string',
                        required: true
                    }
                }
            }
        }
    }
};



function handleJsonSchemaValidationError(err, req, res, next) {

    if (err.name === 'JsonSchemaValidation') {

        console.error(err.message);

        res.status(400); //bad request

        // Format the response body however you want
        var responseData = {
            statusText: 'Bad Request',
            jsonSchemaValidation: true,
            validations: err.validations  // All of your validation information
        };

        // Take into account the content type if your app serves various content types
        if (req.xhr || req.get('Content-Type') === 'application/json') {
            res.json(responseData);
        } else {
            // If this is an html request then you should probably have
            // some type of Bad Request html template to respond with
            res.render('badrequest', responseData);
        }
    } else {
        // pass error to next error middleware handler
        next(err);
    }
}

module.exports = {
    "taggingSchema_v1": taggingSchema_v1,
    "taggingSchema_v2": taggingSchema_v2,
    "taggingSchema_v3": taggingSchema_v3,
    "taggingSchema_v4": taggingSchema_v4,
    "velocitySchema_v1": velocitySchema_v1,
    "velocitySchema_v3": velocitySchema_v3,
    "surroundingsSchema_v3": surroundingsSchema_v3,
    "handleJsonSchemaValidationError": handleJsonSchemaValidationError
};