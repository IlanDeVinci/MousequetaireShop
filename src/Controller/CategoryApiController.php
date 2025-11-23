<?php

namespace App\Controller;

use App\Repository\CategoryRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class CategoryApiController extends AbstractController
{
    #[Route('/api/categories', name: 'api_categories', methods: ['GET'])]
    public function getCategories(CategoryRepository $categoryRepository): JsonResponse
    {
        $categories = $categoryRepository->findAll();

        $data = array_map(function($category) {
            return [
                'id' => $category->getId(),
                'name' => $category->getName(),
            ];
        }, $categories);

        return $this->json($data);
    }
}
