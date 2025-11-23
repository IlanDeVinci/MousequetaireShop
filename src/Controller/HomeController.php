<?php

namespace App\Controller;

use App\Repository\ProductRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class HomeController extends AbstractController
{
    #[Route('/', name: 'app_home')]
    public function index(ProductRepository $productRepository): Response
    {
        $products = $productRepository->findBy([], ['id' => 'ASC'], 4);
        
        return $this->render('home/index.html.twig', array_merge(
            $this->getBannerData(),
            ['products' => $products]
        ));
    }

    private function getBannerData(): array
    {
        $bannerFile = $this->getParameter('kernel.project_dir') . '/var/banner.json';
        $bannerData = file_exists($bannerFile) 
            ? json_decode(file_get_contents($bannerFile), true)
            : ['text' => '🚚 Livraison offerte à partir de 100€ 🚚'];
        
        return ['banner_text' => $bannerData['text']];
    }
}
