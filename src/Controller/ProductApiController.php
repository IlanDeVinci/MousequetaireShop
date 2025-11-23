<?php

namespace App\Controller;

use App\Repository\ProductRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class ProductApiController extends AbstractController
{
    #[Route('/api/products', name: 'api_products', methods: ['GET'], priority: 5)]
    public function getProducts(Request $request, ProductRepository $productRepository): JsonResponse
    {
        $page = $request->query->getInt('page', 1);
        $limit = $request->query->getInt('limit', 12);
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

        $data = array_map(function($product) {
            $image = null;
            if ($product->getMedia() && $product->getMedia()->getFilePath()) {
                $image = '/uploads/' . $product->getMedia()->getFilePath();
            }

            return [
                'id' => $product->getId(),
                'name' => $product->getName(),
                'description' => $product->getDescription(),
                'price' => $product->getPrice(),
                'stock' => $product->getStock(),
                'category' => $product->getCategory() ? $product->getCategory()->getName() : null,
                'image' => $image,
            ];
        }, $products);

        return $this->json([
            'products' => $data,
            'total' => $total,
            'page' => $page,
            'pages' => ceil($total / $limit),
        ]);
    }

    #[Route('/api/products/filter', name: 'api_products_filter', methods: ['GET'], priority: 10)]
    public function filterProducts(Request $request, ProductRepository $productRepository): JsonResponse
    {
        $categoryId = $request->query->getInt('category');
        $minPrice = $request->query->get('min_price');
        $maxPrice = $request->query->get('max_price');
        $inStock = $request->query->getBoolean('in_stock', false);

        $qb = $productRepository->createQueryBuilder('p')
            ->where('p.isActive = :active')
            ->setParameter('active', true);

        if ($categoryId) {
            $qb->andWhere('p.category = :category')
               ->setParameter('category', $categoryId);
        }

        if ($minPrice) {
            $qb->andWhere('p.price >= :minPrice')
               ->setParameter('minPrice', $minPrice);
        }

        if ($maxPrice) {
            $qb->andWhere('p.price <= :maxPrice')
               ->setParameter('maxPrice', $maxPrice);
        }

        if ($inStock) {
            $qb->andWhere('p.stock > 0');
        }

        $products = $qb->getQuery()->getResult();

        $data = array_map(function($product) {
            $images = [];
            if ($product->getMedias()->count() > 0) {
                foreach ($product->getMedias() as $media) {
                    $images[] = '/uploads/' . $media->getFilePath();
                }
            }

            return [
                'id' => $product->getId(),
                'name' => $product->getName(),
                'description' => $product->getDescription(),
                'price' => $product->getPrice(),
                'stock' => $product->getStock(),
                'category' => $product->getCategory() ? $product->getCategory()->getName() : null,
                'images' => $images,
                'image' => !empty($images) ? $images[0] : null,
            ];
        }, $products);

        return $this->json([
            'products' => $data,
            'total' => count($data),
        ]);
    }
}
