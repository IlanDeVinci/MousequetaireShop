<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class HomeController extends AbstractController
{
    #[Route('/', name: 'app_home')]
    public function index(): Response
    {
        return $this->render('home/index.html.twig', $this->getBannerData());
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
