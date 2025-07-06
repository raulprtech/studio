import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PortfolioPage from '@/app/page';
import { getCollectionDocuments } from '@/lib/mock-data';

// Mockea la función de obtención de datos
jest.mock('@/lib/mock-data', () => ({
  getCollectionDocuments: jest.fn(),
}));

// Mock del componente PublicHeader y PublicFooter ya que no son relevantes para este test
jest.mock('@/components/public-header', () => ({
    PublicHeader: () => <header>Header Mock</header>
}));
jest.mock('@/components/public-footer', () => ({
    PublicFooter: () => <footer>Footer Mock</footer>
}));

describe('PortfolioPage', () => {
  beforeEach(() => {
    // Limpia los mocks antes de cada prueba
    (getCollectionDocuments as jest.Mock).mockClear();
  });

  it('debería renderizar la sección de héroe correctamente', async () => {
    // Configura el valor de retorno del mock para esta prueba específica
    (getCollectionDocuments as jest.Mock).mockResolvedValue([]);

    // El componente es asíncrono, por lo que debemos esperar su resolución
    const PageComponent = await PortfolioPage({});
    render(PageComponent);

    // Comprueba el encabezado principal
    expect(screen.getByRole('heading', { level: 1, name: /Hola, soy Raul/i })).toBeInTheDocument();
    expect(screen.getByText(/Desarrollador Full Stack/i)).toBeInTheDocument();
  });

  it('debería mostrar proyectos y posts cuando los datos están disponibles', async () => {
    const mockProjects = [
      { id: 'proj-1', title: 'Proyecto de Prueba 1', description: 'Desc 1', coverImageUrl: 'url1', tags: ['React'] },
    ];
    const mockPosts = [
      { id: 'post-1', title: 'Post de Prueba 1', content: 'Contenido 1', coverImageUrl: 'url2', category: 'Dev', publishedAt: new Date() },
    ];

    (getCollectionDocuments as jest.Mock)
      .mockImplementation(async (collectionName) => {
        if (collectionName === 'projects') return mockProjects;
        if (collectionName === 'posts') return mockPosts;
        return [];
      });

    const PageComponent = await PortfolioPage({});
    render(PageComponent);

    // Comprueba los títulos del proyecto y del post
    expect(await screen.findByText('Proyecto de Prueba 1')).toBeInTheDocument();
    expect(await screen.findByText('Post de Prueba 1')).toBeInTheDocument();
  });

  it('no debería romper si getCollectionDocuments falla', async () => {
    // Simula un error en la obtención de datos
    (getCollectionDocuments as jest.Mock).mockRejectedValue(new Error('Fallo en la API'));
    
    // Espera que la promesa del componente se resuelva (o falle)
    const PageComponent = await PortfolioPage({});
    render(PageComponent);
    
    // La página aún debería renderizar su contenido estático
    expect(screen.getByRole('heading', { level: 1, name: /Hola, soy Raul/i })).toBeInTheDocument();
    
    // Verifica que no se muestren los proyectos
    expect(screen.queryByText('Proyecto de Prueba 1')).not.toBeInTheDocument();
  });
});
