/** OpenAPI 3 spec for Flutter / Dart clients. Served at GET /api/openapi.json */
export function openApiSpec() {
  return {
    openapi: '3.0.3',
    info: {
      title: 'Little Royals School OS API',
      version: '0.0.1',
      description: 'JSON API for the Angular web app and Flutter clients. Send Authorization: Bearer <token>.',
    },
    servers: [{ url: '/api' }],
    components: {
      securitySchemes: {
        bearer: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'teacher', 'accountant', 'parent'] },
            label: { type: 'string' },
          },
        },
        Session: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            tokenType: { type: 'string', example: 'Bearer' },
            expiresIn: { type: 'integer', description: 'Seconds until the token expires' },
            user: { $ref: '#/components/schemas/User' },
          },
        },
        ApiError: {
          type: 'object',
          properties: {
            ok: { type: 'boolean', example: false },
            statusCode: { type: 'integer' },
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    security: [{ bearer: [] }],
    paths: {
      '/': {
        get: {
          security: [],
          summary: 'API name',
          responses: { 200: { description: 'JSON status' } },
        },
      },
      '/status': {
        get: {
          security: [],
          summary: 'Readiness check for Flutter',
          responses: { 200: { description: '{ ok, name, version, time, kafka }' } },
        },
      },
      '/releases': {
        get: {
          security: [],
          summary: 'Product changelog (app + API, same dates)',
          responses: { 200: { description: 'Release array' } },
        },
      },
      '/auth/login': {
        post: {
          security: [],
          summary: 'Sign in',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string' },
                    username: { type: 'string', description: 'Alias for email' },
                    password: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Session' }, 401: { description: 'Invalid' } },
        },
      },
      '/auth/demo': {
        post: {
          security: [],
          summary: 'Demo role session',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { role: { type: 'string', enum: ['admin', 'teacher', 'accountant', 'parent'] } },
                },
              },
            },
          },
          responses: { 200: { description: 'Session' } },
        },
      },
      '/auth/me': { get: { summary: 'Current user', responses: { 200: { description: '{ user }' } } } },
      '/auth/logout': { post: { security: [], summary: 'Logout', responses: { 200: { description: '{ ok }' } } } },
      '/school': {
        get: { summary: 'School profile', responses: { 200: { description: 'School' } } },
        patch: { summary: 'Update school', responses: { 200: { description: 'School' } } },
      },
      '/students': {
        get: { summary: 'Pupils', responses: { 200: { description: 'Array' } } },
        post: { summary: 'Enrol pupil', responses: { 201: { description: 'Pupil' } } },
      },
      '/students/{adm}': { get: { summary: 'One pupil', parameters: [param('adm')], responses: { 200: { description: 'Pupil' } } } },
      '/admissions': {
        get: { summary: 'Applications', responses: { 200: { description: 'Array' } } },
        post: { summary: 'Add application', responses: { 200: { description: 'Applicant' } } },
      },
      '/admissions/{id}': {
        get: { summary: 'One application', parameters: [param('id')], responses: { 200: { description: 'Applicant' } } },
        patch: { summary: 'Move stage', parameters: [param('id')], responses: { 200: { description: 'Applicant' } } },
      },
      '/attendance': { get: { summary: 'Today’s pupil register', responses: { 200: { description: 'Array' } } } },
      '/attendance/{adm}': { patch: { summary: 'Mark pupil', parameters: [param('adm')], responses: { 200: { description: 'Row' } } } },
      '/finance': { get: { summary: 'Invoices', responses: { 200: { description: 'Array' } } } },
      '/inventory': { get: { summary: 'Stock', responses: { 200: { description: 'Array' } } } },
      '/inventory/{id}': { patch: { summary: 'Issue stock', parameters: [param('id')], responses: { 200: { description: 'Item' } } } },
      '/health': { get: { summary: 'Sickbay visits', responses: { 200: { description: 'Array' } } }, post: { summary: 'Log visit', responses: { 200: { description: 'Visit' } } } },
      '/calendar': {
        get: { summary: 'Events', responses: { 200: { description: 'Array' } } },
        post: { summary: 'Add calendar event', responses: { 200: { description: 'Event' } } },
      },
      '/exams': {
        get: { summary: 'Exam papers', responses: { 200: { description: 'Array' } } },
        post: { summary: 'Schedule one paper', responses: { 200: { description: 'Exam' } } },
      },
      '/exams/sitting': { post: { summary: 'Create end-of-term / mid-term sitting', responses: { 200: { description: 'Exam array' } } } },
      '/exams/{id}': { patch: { summary: 'Update exam status or room', parameters: [param('id')], responses: { 200: { description: 'Exam' } } } },
      '/attendance/bulk': { post: { summary: 'Mark a class or the whole register', responses: { 200: { description: 'Array' } } } },
      '/staff': { get: { summary: 'Staff directory', responses: { 200: { description: 'Array' } } } },
      '/clock/me': { get: { summary: 'My clock punches', responses: { 200: { description: '{ open, today, recent }' } } } },
      '/clock/today': { get: { summary: 'Campus clock board', responses: { 200: { description: 'Array' } } } },
      '/clock/in': { post: { summary: 'Clock in', responses: { 200: { description: 'Punch' } } } },
      '/clock/out': { post: { summary: 'Clock out', responses: { 200: { description: 'Punch' } } } },
      '/activities': { get: { summary: 'RBAC activities', responses: { 200: { description: 'Array' } } } },
      '/roles': {
        get: { summary: 'Roles', responses: { 200: { description: 'Array' } } },
        post: { summary: 'Create custom role', responses: { 200: { description: 'Role' } } },
      },
      '/roles/{key}': { delete: { summary: 'Delete custom role', parameters: [param('key')], responses: { 200: { description: '{ ok }' } } } },
      '/perms': {
        get: { summary: 'Permissions matrix', responses: { 200: { description: 'Array' } } },
        patch: { summary: 'Toggle a grant', responses: { 200: { description: 'Row' } } },
      },
      '/changelog': { get: { summary: 'Change log', responses: { 200: { description: 'Array' } } } },
      '/reports': { get: { summary: 'Live totals', responses: { 200: { description: 'Report' } } } },
      '/reports/cards': { get: { summary: 'Report cards index', responses: { 200: { description: 'Array' } } } },
      '/documents': { get: { summary: 'PDF templates', responses: { 200: { description: 'Array' } } } },
      '/documents/{key}/pdf': {
        get: {
          summary: 'Official PDF bytes',
          parameters: [
            param('key'),
            { name: 'adm', in: 'query', schema: { type: 'string' } },
            { name: 'staff', in: 'query', schema: { type: 'string' } },
            { name: 'applicant', in: 'query', schema: { type: 'string' } },
            { name: 'visit', in: 'query', schema: { type: 'string' } },
            { name: 'download', in: 'query', schema: { type: 'string' }, description: '1 = attachment' },
          ],
          responses: {
            200: {
              description: 'application/pdf',
              content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } },
            },
          },
        },
      },
    },
  };
}

function param(name: string) {
  return { name, in: 'path', required: true, schema: { type: 'string' } };
}
