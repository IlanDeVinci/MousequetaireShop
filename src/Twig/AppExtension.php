<?php

namespace App\Twig;

use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Twig\Extension\AbstractExtension;
use Twig\Extension\GlobalsInterface;

class AppExtension extends AbstractExtension implements GlobalsInterface
{
    private ParameterBagInterface $params;

    public function __construct(ParameterBagInterface $params)
    {
        $this->params = $params;
    }

    public function getGlobals(): array
    {
        $bannerFile = $this->params->get('kernel.project_dir') . '/var/banner.json';
        $bannerData = file_exists($bannerFile) 
            ? json_decode(file_get_contents($bannerFile), true)
            : ['text' => '🚚 Livraison offerte à partir de 100€ 🚚'];
        
        return [
            'banner_text' => $bannerData['text'],
        ];
    }
}
