const TAGGING_SCHEMA_V1 = {
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
                    }
                }
            }
        }
    }
};

const TAGGING_SCHEMA_V2 = {
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
                    }
                }
            }
        }
    }
};

const TAGGING_SCHEMA_V3 = {
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

const TAGGING_SCHEMA_V4 = {
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
                    horizontalAccuracy: {
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

const SURROUNDINGS_SCHEMA = {
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

const VELOCITY_SCHEMA = {
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

        var responseData = {
            statusText: 'Bad Request',
            jsonSchemaValidation: true,
            validations: err.validations
        };

        res.status(400).json(responseData);

    } else {
        // pass error to next error middleware handler
        next(err);
    }
}

module.exports = {
    "TAGGING_SCHEMA_V1": TAGGING_SCHEMA_V1,
    "TAGGING_SCHEMA_V2": TAGGING_SCHEMA_V2,
    "TAGGING_SCHEMA_V3": TAGGING_SCHEMA_V3,
    "TAGGING_SCHEMA_V4": TAGGING_SCHEMA_V4,
    "SURROUNDINGS_SCHEMA": SURROUNDINGS_SCHEMA,
    "VELOCITY_SCHEMA": VELOCITY_SCHEMA,
    "handleJsonSchemaValidationError": handleJsonSchemaValidationError
};