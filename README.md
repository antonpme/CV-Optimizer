# AI-Powered CV Optimization Platform

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-%3E%3D5.0.0-blue)](https://www.typescriptlang.org/)

An intelligent web application that empowers job seekers to optimize their CVs for specific job applications using AI analysis, dramatically improving their chances of landing interviews while maintaining ethical standards and user control.

## 🚀 Features

### Core Functionality
- **CV Upload & Optimization**: Upload CVs in PDF, DOC, DOCX formats and get AI-powered optimization
- **Job Description Processing**: Add job posting URLs for automatic scraping and analysis
- **Tailored CV Generation**: Generate customized CVs for each job application
- **Cover Letter Generation**: Automatic creation of personalized cover letters
- **User Profile Management**: Comprehensive profile with professional details and social links
- **Approval System**: Review and approve AI-generated content before use
- **Export Options**: Export optimized CVs and cover letters in multiple formats

### AI-Powered Features
- **Smart CV Analysis**: AI identifies strengths, weaknesses, and improvement opportunities
- **Job Matching**: Advanced algorithms match CV content with job requirements
- **Keyword Optimization**: ATS-friendly keyword integration
- **Tone Adaptation**: Customize optimization level from conservative to aggressive
- **Quality Scoring**: Confidence scores for all AI-generated content

### User Experience
- **Intuitive Interface**: Clean, modern UI built with Next.js and Tailwind CSS
- **Progress Tracking**: Real-time status updates for all processing tasks
- **Responsive Design**: Mobile-first approach with full responsive support
- **Accessibility**: WCAG 2.1 compliant with full keyboard navigation

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Express.js, TypeScript, Prisma ORM
- **Database**: PostgreSQL 15
- **AI Services**: OpenAI GPT-4, Claude 3 API integration
- **Queue System**: Bull Queue with Redis
- **File Storage**: AWS S3 with CloudFront CDN
- **Containerization**: Docker, Docker Compose

### System Components
```
Frontend (Next.js) → API Gateway → Backend Services
                                      ↓
Database (PostgreSQL) ←→ Queue System (Redis/Bull)
                                      ↓
AI Services (OpenAI/Claude) ←→ File Storage (AWS S3)
```

## 📋 Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose
- AWS Account (for S3 storage)
- OpenAI/Claude API keys

## 🛠️ Installation

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/cv-optimizer.git
   cd cv-optimizer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Database Setup**
   ```bash
   # Start PostgreSQL and Redis with Docker
   docker-compose up -d postgres redis

   # Run database migrations
   npx prisma migrate dev

   # Seed the database (optional)
   npx prisma db seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/cv_optimizer"

# Redis
REDIS_URL="redis://localhost:6379"

# AI Services
OPENAI_API_KEY="your-openai-api-key"
CLAUDE_API_KEY="your-claude-api-key"

# AWS S3
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_S3_BUCKET="your-s3-bucket-name"
AWS_REGION="us-east-1"

# JWT
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-jwt-refresh-secret"

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Application
NODE_ENV="development"
PORT="3000"
API_URL="http://localhost:3000/api"
```

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### CV Management
- `POST /api/cvs/upload` - Upload CV file
- `GET /api/cvs` - List user CVs
- `POST /api/cvs/:id/optimize` - Optimize specific CV

### Job Descriptions
- `POST /api/job-descriptions` - Add job URLs
- `GET /api/job-descriptions` - List job descriptions

### CV Generation
- `POST /api/generated-cvs` - Generate tailored CVs
- `GET /api/generated-cvs` - List generated CVs

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Or build manually
docker build -t cv-optimizer .
docker run -p 3000:3000 cv-optimizer
```

### Cloud Deployment Options

- **Vercel**: Frontend deployment
- **Railway/Heroku**: Full-stack deployment
- **AWS**: EC2/ECS for backend, S3 for storage
- **Google Cloud**: App Engine or Cloud Run

## 🔒 Security

This platform implements comprehensive security measures:

- **Authentication**: JWT-based auth with refresh tokens
- **Authorization**: Role-based access control (RBAC)
- **Data Encryption**: AES-256 encryption for sensitive data
- **API Security**: Rate limiting, input validation, CORS
- **Compliance**: GDPR, CCPA compliance features
- **Monitoring**: Security event logging and alerting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Write comprehensive tests
- Follow conventional commit messages
- Maintain code coverage > 80%
- Use ESLint and Prettier
- Document API changes

## 📈 Roadmap

### Phase 1 (MVP) - Current
- ✅ User authentication and profiles
- ✅ CV upload and basic optimization
- ✅ Job description processing
- ✅ Basic CV generation

### Phase 2 (Q2 2025)
- 🔄 Multiple job processing
- 🔄 Cover letter generation
- 🔄 Bulk operations
- 🔄 Advanced AI features

### Phase 3 (Q3 2025)
- 📋 Personal profile integration
- 📋 Analytics and reporting
- 📋 Application tracking
- 📋 Performance optimization

### Phase 4 (Q4 2025)
- 🎯 Application submission system
- 🎯 ATS optimization
- 🎯 Multi-language support
- 🎯 Advanced integrations

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI and Anthropic for AI capabilities
- Next.js team for the amazing framework
- Prisma team for the excellent ORM
- All contributors and beta testers

## 📞 Support

- **Documentation**: [docs.cv-optimizer.com](https://docs.cv-optimizer.com)
- **Issues**: [GitHub Issues](https://github.com/your-username/cv-optimizer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/cv-optimizer/discussions)
- **Email**: support@cv-optimizer.com

---

**Built with ❤️ for job seekers worldwide**