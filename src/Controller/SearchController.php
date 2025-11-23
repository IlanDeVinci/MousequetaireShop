<?php

namespace App\Controller;

use App\Repository\ProductRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class SearchController extends AbstractController
{
    #[Route('/api/products/search', name: 'api_product_search', methods: ['GET'], priority: 10)]
    public function search(Request $request, ProductRepository $productRepository): JsonResponse
    {
        $query = $request->query->get('q', '');
        
        if (strlen($query) < 2) {
            return $this->json([]);
        }

        $products = $productRepository->searchByName($query);
        
        $results = array_map(function($product) {
            $image = null;
            
            // Check for multiple images first
            if ($product->getMedias() && $product->getMedias()->count() > 0) {
                $firstMedia = $product->getMedias()->first();
                if ($firstMedia && $firstMedia->getFilePath()) {
                    $image = '/uploads/' . $firstMedia->getFilePath();
                }
            }
            // Fallback to single media
            elseif ($product->getMedia() && $product->getMedia()->getFilePath()) {
                $image = '/uploads/' . $product->getMedia()->getFilePath();
            }
            
            return [
                'id' => $product->getId(),
                'name' => $product->getName(),
                'price' => $product->getPrice(),
                'category' => $product->getCategory() ? $product->getCategory()->getName() : null,
                'image' => $image,
            ];
        }, $products);
        
        return $this->json($results);
    }
}
