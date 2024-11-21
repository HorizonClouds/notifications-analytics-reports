import analyticService from '../services/analyticService.js';
import { NotFoundError, ValidationError } from '../utils/customErrors.js';

const removeMongoFields = (data) => {
    if (Array.isArray(data)) {
        return data.map((item) => {
            const { __v, ...rest } = item.toObject();
            return rest;
        });
    } else {
        const { __v, ...rest } = data.toObject();
        return rest;
    }
};
export const getAnalyticById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const analytic = await analyticService.getAnalyticById(id);
    if (!analytic) throw new NotFoundError('Analytic not found');
    res.sendSuccess(removeMongoFields(analytic));
  } catch (error) {
    res.sendError(error);
  }
};
export const createAnalytic = async (req, res, next) => {
    try {
      // Llamada al servicio para crear un nuevo análisis de itinerario
      const newAnalytic = await analyticService.createAnalytic(req.body);
  
      // Respuesta exitosa con los datos creados y mensaje
      res.sendSuccess(
        removeMongoFields(newAnalytic), // Limpia los campos internos de Mongo (_id, __v)
        'Analytic created successfully',
        201 // Código de estado HTTP para creación exitosa
      );
    } catch (error) {
      // Manejo de errores de validación
      if (error.name === 'ValidationError') {
        res.sendError(new ValidationError('Validation failed', error.errors));
      } else {
        // Manejo de otros errores generales
        res.sendError(
          new ValidationError(
            'An error occurred while creating the analytic',
            [{ msg: error.message }]
          )
        );
      }
    }
};

export const getAnalyticByUserId = async (req, res) => {
  try {
    const { userId } = req.params; // Extrae userId de los parámetros de la solicitud
    const analyticByUser = await analyticService.getAnalyticByUserId(userId); // Llama al servicio para buscar la analítica
    res.sendSuccess(analyticByUser); // Devuelve la analítica encontrada
  } catch (error) {
    res.sendError(error); // Devuelve el error en caso de fallo
  }
};
 
export const getAllAnalytics = async (req, res, next) => {
  try {
      const analytics = await analyticService.getAllAnalytics();
      res.sendSuccess(removeMongoFields(analytics));
  } catch (error) {
      res.sendError(error);
  }
};

export const getItineraryAnalytics = async (req, res, next) => {
    try {
      const filters = req.query; // Filtros opcionales enviados en la solicitud
      const analytics = await analyticService.getItineraryAnalytics(filters);
      res.sendSuccess(analytics);
    } catch (error) {
      next(error);
    }
};
  
export const updateItineraryAnalytic = async (req, res, next) => {
    try {
      const { id } = req.params; // ID del análisis a actualizar
      const updateData = req.body;
      const updatedAnalytic = await analyticService.updateItineraryAnalytic(id, updateData);
      res.sendSuccess(updatedAnalytic);
    } catch (error) {
      next(error);
    }
};
  
export const deleteItineraryAnalytic = async (req, res, next) => {
    try {
      const { id } = req.params;
      await analyticService.deleteItineraryAnalytic(id);
      res.sendSuccess({ message: 'Itinerary analytic deleted successfully' });
    } catch (error) {
      next(error);
    }
};