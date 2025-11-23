<?php

namespace App\Controller;

use App\Repository\ProductRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class ProductController extends AbstractController
{
    #[Route('/products', name: 'app_products')]
    public function list(ProductRepository $productRepository, \Symfony\Component\HttpFoundation\Request $request): Response
    {
        $page = $request->query->getInt('page', 1);
        $limit = 12;
        $offset = ($page - 1) * $limit;

        // Use QueryBuilder to ensure isActive is exactly true (not null)
        $qb = $productRepository->createQueryBuilder('p')
            ->where('p.isActive = :active')
            ->setParameter('active', true)
            ->orderBy('p.id', 'DESC')
            ->setMaxResults($limit)
            ->setFirstResult($offset);

        $products = $qb->getQuery()->getResult();

        $total = $productRepository->createQueryBuilder('p')
            ->select('COUNT(p.id)')
            ->where('p.isActive = :active')
            ->setParameter('active', true)
            ->getQuery()
            ->getSingleScalarResult();

        $pages = (int) ceil($total / $limit);

        return $this->render('product/list.html.twig', [
            'products' => $products,
            'total' => $total,
            'page' => $page,
            'pages' => $pages,
        ]);
    }

    #[Route('/product/{id}', name: 'app_product_show')]
    public function show(int $id, ProductRepository $productRepository): Response
    {
        $product = $productRepository->find($id);
        
        if (!$product) {
            throw $this->createNotFoundException('Product not found');
        }
        
        return $this->render('product/show.html.twig', [
            'product' => $product,
        ]);
    }
}
